# -*- coding: utf-8 -*-
# __author__ = 'Binbin.Zhao'

"""WGS V2"""

from biocluster.workflow import Workflow
from biocluster.core.exceptions import OptionError
from bson.objectid import ObjectId
import os
import re
import json
import time
import shutil


class WgsV2Workflow(Workflow):
    def __init__(self, wsheet_object):
        """
        version = 1.0.0
        lasted modifed by BinbinZhao 20190321
        """
        self._sheet = wsheet_object
        super(WgsV2Workflow, self).__init__(wsheet_object)
        options = [
            {'name': 'in_fastq', 'type': 'infile', 'format': 'sequence.fastq_dir'},  # fq fold
            {"name": "group", "type": "infile", "format": "meta.otu.group_table"},
            {"name": "genome_version_id", "type": "string"},  # Genome version ObjectId
            {"name": "snp_indel_method", "type": "string", "default": "gatk"},  # gatk,samtools,freebayes,sentieon
            {"name": "cnv_method", "type": "string", "default": "cnvnator"},  # method of call cnv
            {"name": "sv_method", "type": "string", "default": "delly"},  # method of call sv
            {"name": "is_sv", "type": "bool", "default": True},
            {"name": "is_cnv", "type": "bool", "default": True},
            {"name": "genome_info", "type": "infile", "format": "dna_evolution.genome_path"},  # Directory of reference genomes
            {"name": "data_table", "type": "string"},
            {"name": "species_id", "type": "string"},
            {"name": "mail_info", 'type': "string", 'default': ""},
            {'name': 'cluster_sign', 'type': 'string', 'default': ''}  # The specified cluster, empty by default, assigned randomly
        ]
        self.add_option(options)
        self.set_options(self._sheet.options())
        self.project_type = 'dna_wgs_v2'
        self.api_base = self.api.api("wgs.api_base")   # base module of database
        self.api_base.project_type = 'dna_wgs_v2'
        self.wgs_base = self.api.api('wgs.wgs_base')
        self.wgs_base.project_type = 'dna_wgs_v2'
        self.evolution_base = self.api.api('dna_evolution.evolution_base')
        self.evolution_base.project_type = "dna_wgs_v2"
        self.json_path = self.config.SOFTWARE_DIR + "/database/dna_geneome/"
        self.genome_config = self.add_module("wgs.genome_config_v2")
        self.qc_stat = self.add_module("wgs_v2.qc_stat")  # quality control
        self.mapping = self.add_module("wgs.mapping")  # mapping
        self.bam_realign = self.add_module("wgs_v2.bam_realign")
        self.mapping_stat = self.add_module("wgs.mapping_stat")  # results of mapping
        self.call_snp_indel = self.add_module("wgs.call_snp_indel")  # call_snp_indel
        self.cnv_call = self.add_module("wgs.cnv_call")  # cnv_call
        self.sv_call = self.add_module("wgs_v2.sv_call")  # sv_call
        self.vcf_filter = self.add_module("wgs.vcf_filter")  # vcf_filter
        self.annovar = self.add_module("wgs.annovar")  # annovar
        self.circos = self.add_tool("wgs_v2.circos")
        self.chrdistribution = self.add_tool("wgs_v2.chromosome_distribution")  # Chromosomal profile
        self.go_summary = self.add_tool("dna_evolution.go_summary")
        self.step.add_steps("qc_stat", "mapping", "call_snp_indel", "vcf_filter", "call_cnv", "call_sv", "annovar",
                            "circos", "chr_distribution")
        self.target_dir = ""
        self.genomefile_path, self.ref_dict, self.snpeff_path, self.ref, self.gff, self.anno,  = "", "", "", "", "", ""
        self.software, self.region, self.chr_set, self.anno_summary = '', "", "", ""
        self.call_type = 'sentieon' if self.option("snp_indel_method").lower() == 'gatk' \
            else self.option("snp_indel_method").lower()
        self.is_cnvnator = False
        self.large_genome = "false"
        self.genome_version_id = self.option("genome_version_id") if self.option("genome_version_id") else ''
        self.has_genome, self.has_chromosomelist, self.species_path, self.species, self.genome_version, self.secret = \
            True, "", "", '', '', ''
        self.bam_list = self.mapping.output_dir + "/bam.list" if self.option("snp_indel_method").lower() != "gatk" \
            else self.bam_realign.output_dir + "/bam.list"
        self.logger.info("self.bam_list:{}".format(self.bam_list))
        self.bam_dir = self.mapping.output_dir
        self.call_id, self.anno_id, self.raw_data_path, self.circos_sample, self.chromosome, self.variant =\
            '', '', '', '', '', ''

    def check_options(self):

        if not self.option("in_fastq").is_set:
            raise OptionError("fastq folder path is required！")
        if not self.option("genome_info").is_set and not self.option("genome_version_id"):
            raise OptionError("genome_info or genome_version_id must exist！")
        if self.option("snp_indel_method").lower() not in ['gatk', 'samtools', 'freebayes', "sentieon"]:
            raise OptionError("The value of snp_indel_method must in range of 'gatk', 'samtools', 'freebayes', 'sentieon'!")
        return True

    def run_genome_config(self):
        mailinfo = {}
        mailinfo['task_id'] = self._sheet.id
        mailinfo['species'] = self.species
        mailinfo['version'] = self.genome_version
        if self.option("mail_info"):
            try:
                mailinfo['project_id'] = self.option("mail_info").split(',')[0]
                mailinfo['email_id'] = self.option("mail_info").split(',')[1]
            except:
                pass
        options = {
            'reffa': self.option("genome_info").prop['path'].rstrip('/') + "/ref.fa",
            "refgff": self.option("genome_info").prop['path'].rstrip('/') + "/ref.gff",
            "info": self.option("genome_info").prop['path'].rstrip('/') + "/info.log",
            'mail_info': json.dumps(mailinfo),
            'target_dir': self.target_dir
        }
        if self.has_chromosomelist:
            options.update({"chromosomelist": self.option("genome_info").prop['path'].rstrip('/') + "/chr.list"})
        else:
            options.update({
                "need_rename": 'false',
                "ref_changelog": self.option("genome_info").prop['path'].rstrip('/') + "/ref.changelog"
            })
        if os.path.exists(self.option("genome_info").prop['path'].rstrip('/') + '/anno.summary'):
            options.update({
                'anno_summary': self.option("genome_info").prop['path'].rstrip('/') + '/anno.summary'
            })
        self.genome_config.set_options(options)
        self.genome_config.on("start", self.set_step, {'start': self.step.genome_config})
        self.genome_config.on("end", self.set_step, {'end': self.step.genome_config})
        self.genome_config.on("end", self.set_output, "genome_config")
        self.genome_config.run()

    def run_qc_stat(self):
        self.qc_stat.set_options({
            "fastq_dir": self.option("in_fastq"),
            "task_id": self._sheet.id
        })
        self.qc_stat.on("end", self.set_output, "qc_stat")
        self.qc_stat.on("start", self.set_step, {'start': self.step.qc_stat})
        self.qc_stat.on("end", self.set_step, {'end': self.step.qc_stat})
        self.qc_stat.run()

    def run_mapping(self):
        self.mapping.set_options({
            "fastq_list": self.qc_stat.output_dir + "/clean_data/fastq.list",  # fastq list after qc
            "ref_fa": self.ref,
            "large_genome": self.large_genome
        })
        self.mapping.on("end", self.set_output, "mapping")
        self.mapping.on("start", self.set_step, {'start': self.step.mapping})
        self.mapping.run()

    def run_mapping_stat(self):
        self.mapping_stat.set_options({
            "bam_list": self.bam_list,
            "ref_dict": self.ref_dict,
            "step_num": 100000,
            "ref_fa": self.ref,
            "large_genome": self.large_genome
        })
        self.mapping_stat.on("end", self.set_output, "mapping_stat")
        self.mapping_stat.on("end", self.set_step, {'end': self.step.mapping})
        self.mapping_stat.run()

    def run_bam_realign(self):
        self.bam_realign.set_options({
            "bam_list": self.mapping.output_dir + "/bam.list",
            "fa_file": self.ref
        })
        self.bam_realign.on("start", self.set_step, {'start': self.step.realign_bam})
        self.bam_realign.on("end", self.set_step, {'end': self.step.realign_bam})
        self.bam_realign.run()

    def run_call_snp_indel(self):
        self.call_snp_indel.set_options({
            "bam_list": self.bam_list,
            "ref_dict": self.ref_dict,
            "ref_fasta": self.ref,
            "call_type": self.call_type
        })
        self.call_snp_indel.on("end", self.set_output, "snp_indel")
        self.call_snp_indel.on("start", self.set_step, {'start': self.step.call_snp_indel})
        self.call_snp_indel.on("end", self.set_step, {'end': self.step.call_snp_indel})
        self.call_snp_indel.run()

    def run_vcf_filter(self):
        self.vcf_filter.set_options({
            "ref_fasta": self.ref,
            "pop_var_vcf": self.call_snp_indel.output_dir + "/vcf_call/pop.variant.vcf",
            "snpEff_config": self.snpeff_path,
            "need_mutation_distribution": True
        })
        self.vcf_filter.on("end", self.set_output, "vcf_filter")
        self.vcf_filter.on("start", self.set_step, {'start': self.step.vcf_filter})
        self.vcf_filter.on("end", self.set_step, {'end': self.step.vcf_filter})
        self.vcf_filter.run()

    def run_annovar(self):
        self.annovar.set_options({
            "snp_anno_primary_vcf": self.vcf_filter.output_dir + "/eff/snp.anno.primary.vcf",
            "indel_anno_primary_vcf": self.vcf_filter.output_dir + "/eff/indel.anno.primary.vcf",
            "ref_fasta": self.ref,
            "snp_anno_genes": self.vcf_filter.output_dir + "/eff/snp.anno.genes.txt",
            "indel_anno_genes": self.vcf_filter.output_dir + "/eff/indel.anno.genes.txt",
            "anno_summary": self.anno
        })
        self.annovar.on("end", self.set_output, "annovar")
        self.annovar.on("end", self.run_go_summary)
        self.annovar.on("start", self.set_step, {'start': self.step.annovar})
        self.annovar.on("end", self.set_step, {'end': self.step.annovar})
        self.annovar.run()

    def run_go_summary(self):
        options = {
            "pop_summary": self.annovar.output_dir + "/anno_count/pop.summary"
        }
        self.go_summary.set_options(options)
        self.go_summary.on('end', self.set_output, "go_summary")
        self.go_summary.run()

    def run_cnv_call(self):
        self.cnv_call.set_options({
            "bam_list": self.mapping.output_dir + "/bam.list",
            "ref_gff": self.gff
        })
        self.cnv_call.on("end", self.set_output, "cnv_call")
        self.cnv_call.on("start", self.set_step, {'start': self.step.cnv_call})
        self.cnv_call.on("end", self.set_step, {'end': self.step.cnv_call})
        self.cnv_call.run()

    def run_sv_call(self):
        self.sv_call.set_options({
            "bam_list": self.bam_dir,
            "ref_fa": self.ref
        })
        self.sv_call.on("end", self.set_output, "sv_call")
        self.sv_call.on("start", self.set_step, {'start': self.step.sv_call})
        self.sv_call.on("end", self.set_step, {'end': self.step.sv_call})
        self.sv_call.run()

    def run_circos(self):
        self.set_circos_params(self.genomefile_path.rstrip('/') + "/ref.gff",
                               self.annovar.output_dir + "/combine_variants/pop.final.vcf",
                               self.sv_call.output_dir + "/bcftools_convert/pop.sort.sv.vcf",
                               self.cnv_call.output_dir + "/anno/")
        options = {
            "gff": self.genomefile_path.rstrip('/') + "/ref.gff",
            "chrlist": self.genomefile_path.rstrip('/') + "/ref.chrlist",
            "color": 1,
            "chromosome": self.chromosome,
            "variant": json.dumps(self.variant)
        }
        self.circos.set_options(options)
        self.circos.on("end", self.set_output, "circos")
        self.circos.run()

    def run_chrdistribution(self):
        self.chrdistribution.set_options({
            "pos_file": self.annovar.output_dir + "/combine_variants/pop.final.vcf",
            "marker_type": "SNP+InDel",
            "data_type": 'before',
            "analysis_object": 'all',
            "graphic_style": "heatmap",
            "win_step": 500000
        })
        self.chrdistribution.on("end", self.set_output, "chrdistribution")
        self.chrdistribution.run()

    def run(self):
        task_list = [self.mapping_stat, self.circos, self.chrdistribution, self.go_summary]
        self.get_target_dir()  # get the remote path for saving files
        self.wgs_base.add_sg_task(self._sheet.member_id, self._sheet.member_type, self._sheet.cmd_id)
        if self.option("genome_info").is_set:
            self.has_genome, self.genome_version_id, self.has_chromosomelist, self.species_path, self.species, self. \
                genome_version, self.secret = \
                self.evolution_base.set_genome_info(self.option("genome_info").prop['path'] + "/info.log")
        self.logger.info("has_genome:{}".format(self.has_genome))
        self.logger.info("genome_version_id: {},".format(self.genome_version_id))
        self.logger.info("cluster: {},".format(self.option('cluster_sign').lower()))
        if self.option('cluster_sign').lower() in ['tsg', 'tsanger']:
            pass
        else:
            if not self.has_genome and self.option('cluster_sign').lower() != 'sanger':
                self.set_error('The system cannot detect the reference genome, please check the page to select the '
                               'cluster option, set the parameter as sanger, and run again!')
        if self.has_genome:
            self.set_ref_info()
        else:
            self.is_cnvnator_set()
        self.qc_stat.on('end', self.run_mapping)
        if self.call_type.lower() == "sentieon":
            self.step.add_steps('realign_bam')
            self.mapping.on("end", self.run_bam_realign)
            self.bam_realign.on("end", self.run_mapping_stat)
            self.bam_realign.on("end", self.run_call_snp_indel)
        else:
            self.mapping.on("end", self.run_mapping_stat)
            self.mapping.on("end", self.run_call_snp_indel)
        self.call_snp_indel.on("end", self.run_vcf_filter)
        self.vcf_filter.on("end", self.run_annovar)
        self.annovar.on('end', self.run_chrdistribution)
        if self.option("is_sv") and self.is_cnvnator:
            self.logger.info("is_cnv:{},is_sv:{}333".format(self.is_cnvnator, self.option("is_sv")))
            self.mapping.on("end", self.run_cnv_call)
            self.mapping.on("end", self.run_sv_call)
            task_list.extend([self.cnv_call, self.sv_call])
            self.step.add_steps('cnv_call', 'sv_call')
            self.on_rely([self.annovar, self.cnv_call, self.sv_call], self.run_circos)
        elif self.option("is_sv") and not self.is_cnvnator:
            self.on_rely([self.annovar, self.sv_call], self.run_circos)
            self.mapping.on("end", self.run_sv_call)
            task_list.append(self.sv_call)
            self.step.add_steps('sv_call')
        elif not self.option("is_sv") and self.is_cnvnator:
            self.on_rely([self.annovar, self.cnv_call], self.run_circos)
            self.mapping.on("end", self.run_cnv_call)
            task_list.append(self.cnv_call)
            self.step.add_steps('cnv_call')
        else:
            self.annovar.on("end", self.run_circos)
        self.on_rely(task_list, self.end)
        if not self.has_genome:
            self.step.add_steps('genome_config')
            self.run_genome_config()
        else:
            self.run_qc_stat()
        super(WgsV2Workflow, self).run()

    def set_step(self, event):
        if 'start' in event['data'].keys():
            event['data']['start'].start()
        if 'end' in event['data'].keys():
            event['data']['end'].finish()
        self.step.update()

    def move2outputdir(self, olddir, newname):
        """
        Move all files in one fold to output fold of workflow
        :param olddir: origin path
        :param newname: target path
        :return:
        """
        start = time.time()
        if not os.path.isdir(olddir):
            self.set_error('The folder need to move to the output directory does not exist。', code="14501303")
            self.set_error('The folder need to move to the output directory does not exist。', code="14501303")
            self.set_error('The folder need to move to the output directory does not exist。', code="14501303")
        newdir = os.path.join(self.output_dir, newname)
        if not os.path.exists(newdir):
            os.makedirs(newdir)
        allfiles = os.listdir(olddir)
        oldfiles = [os.path.join(olddir, i) for i in allfiles]
        newfiles = [os.path.join(newdir, i) for i in allfiles]
        for newfile in newfiles:
            if os.path.isfile(newfile) and os.path.exists(newfile):
                os.remove(newfile)
            elif os.path.isdir(newfile) and os.path.exists(newfile):
                shutil.rmtree(newfile)
        for i in range(len(allfiles)):
            self.move_file(oldfiles[i], newfiles[i])
        end = time.time()
        duration = end - start

    def move_file(self, old_file, new_file):
        """
        Recursively moves a file or folder to the specified path
        :param old_file: origin path
        :param new_file: target path
        :return:
        """
        if os.path.isfile(old_file):
            os.link(old_file, new_file)
        else:
            os.mkdir(new_file)
            for file_ in os.listdir(old_file):
                file_path = os.path.join(old_file, file_)
                new_path = os.path.join(new_file, file_)
                self.move_file(file_path, new_path)

    def set_output(self, event):
        obj = event["bind_object"]
        if event['data'] == "qc_stat":
            self.move2outputdir(obj.output_dir, self.output_dir + "/01.fastq_qc")
        if event['data'] == 'genome_config':
            has_genome, genome_version_id = self.evolution_base.check_genome_ready(self.species, self.genome_version)
            if not has_genome:
                self.move2outputdir(obj.output_dir, self.json_path + self.species_path)
            self.logger.info("Run set_ref_info")
            self.set_ref_info(is_update=True)
            self.logger.info("Run set_ref_info successful!")
            self.logger.info("Run qc_stat module")
            self.run_qc_stat()
        if event['data'] == "mapping":
            self.move2outputdir(obj.output_dir + '/sort_bams', self.output_dir + "/03.map_stat/map_bam/sort_bams")
        if event['data'] == "mapping_stat":
            self.move2outputdir(obj.output_dir, self.output_dir + "/03.map_stat")
        if event['data'] == "snp_indel":
            self.move2outputdir(obj.output_dir, self.output_dir + "/04.snp_indel/vcf_call")
        if event['data'] == "vcf_filter":
            self.move2outputdir(obj.output_dir, self.output_dir + "/04.snp_indel")
        if event['data'] == "annovar":
            self.move2outputdir(obj.output_dir, self.output_dir + "/05.annovar")
        if event['data'] == "cnv_call":
            self.move2outputdir(obj.output_dir, self.output_dir + "/06.cnv")
        if event['data'] == "sv_call":
            self.move2outputdir(obj.output_dir, self.output_dir + "/07.sv")
        if event['data'] == "circos":
            self.move2outputdir(obj.output_dir, self.output_dir + "/09.visualization/01.circos")
        if event['data'] == "chrdistribution":
            self.move2outputdir(obj.output_dir, self.output_dir + "/09.visualization/02.chrdistribution")
        if event['data'] == "go_summary":
            self.move2outputdir(obj.output_dir, self.output_dir + "/05.annovar/go_summary")

    def send_files(self):
        self.remove_file()
        repaths = [
            [".", "", "", 0, "320001"],
            ["01.fastq_qc", "", "", 0, "320002"],
            ["01.fastq_qc/rawdata_qc", "", "", 0, "320003"],
            ["01.fastq_qc/rawdata_qc/qc.xls", "xls", "", 0, "320004"],
            ["01.fastq_qc/rawdata_qc/atgc", "", "", 0, "320005"],
            ["01.fastq_qc/rawdata_qc/qual", "", "", 0, "320006"],
            ["01.fastq_qc/clean_data", "", "", 0, "320007"],
            ["01.fastq_qc/clean_data/fastq.list", "", "", 0, "320008"],
            ["01.fastq_qc/cleandata_qc", "", "", 0, "320009"],
            ["01.fastq_qc/cleandata_qc/qc.xls", "xls", "", 0, "320010"],
            ["01.fastq_qc/cleandata_qc/atgc", "", "", 0, "320011"],
            ["01.fastq_qc/cleandata_qc/qual", "", "", 0, "320012"],
            ["02.reference", "", "", 0, "320013"],
            ["02.reference/ref.fa", "", "", 0, "320014"],
            ["02.reference/ref.chrlist", "", "", 0, "320015"],
            ["02.reference/ref.changelog", "", "", 0, "320016"],
            ["02.reference/info.log", "", "", 0, "320017"],
            ["02.reference/ref.gff", "", "", 0, "320018"],
            ["02.reference/ref.2bit", "", "", 0, "320019"],
            ["02.reference/ssr.ref.result.xls", "xls", "", 0, "320020"],
            ["03.map_stat", "", "", 0, "320021"],
            ["03.map_stat/map_bam", "", "", 0, "320022"],
            ["03.map_stat/map_bam/sort_bams", "", "", 0, "320023"],
            ["03.map_stat/result.stat/Total.mapped.detail.xls", "", "", 0, "320024"],
            ["03.map_stat/insert", "", "", 0, "320025"],
            ["03.map_stat/depth", "", "", 0, "320026"],
            ["03.map_stat/coverage", "", "", 0, "320027"],
            ["03.map_stat/result.stat", "", "", 0, "320028"],
            ["04.snp_indel", "", "", 0, "320029"],
            ["04.snp_indel/eff", "", "", 0, "320030"],
            ["04.snp_indel/eff/snp.anno.primary.vcf", "", "", 0, "320031"],
            ["04.snp_indel/eff/indel.anno.primary.vcf", "", "", 0, "320032"],
            ["04.snp_indel/variant_stat", "", "", 0, "320033"],
            ["04.snp_indel/anno_stat", "", "", 0, "320034"],
            ["04.snp_indel/variant_stat/snp.stat", "", "", 0, "320035"],
            ["04.snp_indel/variant_stat/snp.GQ", "", "", 0, "320036"],
            ["04.snp_indel/variant_stat/snp.depth", "", "", 0, "320037"],
            ["04.snp_indel/variant_stat/snp.matrix", "", "", 0, "320038"],
            ["04.snp_indel/variant_stat/indel.stat", "", "", 0, "320039"],
            ["04.snp_indel/variant_stat/indel.len", "", "", 0, "320040"],
            ["04.snp_indel/variant_stat/indel.matrix", "", "", 0, "320041"],
            ["04.snp_indel/variant_stat/indel.GQ", "", "", 0, "320042"],
            ["04.snp_indel/variant_stat/indel.depth", "", "", 0, "320043"],
            ["04.snp_indel/anno_stat/snp.stat", "", "", 0, "320044"],
            ["04.snp_indel/anno_stat/indel.stat", "", "", 0, "320045"],
            ["05.annovar", "", "", 0, "320046"],
            ["05.annovar/combine_variants", "", "", 0, "320047"],
            ["05.annovar/combine_variants/pop.final.vcf", "", "", 0, "320048"],
            ["05.annovar/anno_count", "", "", 0, "320049"],
            ["05.annovar/anno_count/pop.summary", "", "", 0, "320050"],
            ["05.annovar/anno_count/pop.stat.csv", "", "", 0, "320051"],
            ["05.annovar/anno_count/pop.go.stat", "", "", 0, "320052"],
            ["05.annovar/anno_count/pop.kegg.stat", "", "", 0, "320053"],
            ["05.annovar/anno_count/pop.eggnog.stat", "", "", 0, "320054"],
            ["05.annovar/eggnog_anno", "", "", 0, "320055"],
            ["05.annovar/eggnog_anno/pop.eggnog.final.stat.detail", "", "", 0, "320056"],
            ["05.annovar/go_anno", "", "", 0, "320057"],
            ["05.annovar/go_anno/pop.go.final.stat.detail", "", "", 0, "320058"],
            ["05.annovar/kegg_anno", "", "", 0, "320059"],
            ["05.annovar/kegg_anno/pop.kegg.final.stat.detail", "", "", 0, "320060"],
            ["05.annovar/kegg_anno/pathway_dir", "", "", 0, "320061"],
            ["06.cnv", "", "", 0, "320062"],
            ["06.cnv/cnv.stat.xls", "xls", "", 0, "320063"],
            ["06.cnv/length", "", "", 0, "320064"],
            ["06.cnv/anno", "", "", 0, "320065"],
            ["06.cnv/cnv", "", "", 0, "320066"],
            ["07.sv", "", "", 0, "320067"],
            ["07.sv/sv.stat.xls", "xls", "", 0, "320068"],
            ["07.sv/length", "", "", 0, "320069"],
            ["07.sv/anno", "", "", 0, "320070"],
            ["07.sv/sv", "", "", 0, "320071"],
            ["08.ssr", "", "", 0, "320072"],
            ["08.ssr/ssr.stat", "", "", 0, "320073"],
            ["08.ssr/ssr.ref.result.xls", "xls", "", 0, "320074"],
            ["09.circos", "", "", 0, "320075"]
        ]

        regexps = [
            [r"01.fastq_qc/rawdata_qc/atgc/.*\.xls", "xls", "", 0, "320076"],
            [r"01.fastq_qc/rawdata_qc/qual/.*\.xls", "xls", "",0,"320077"],
            [r"01.fastq_qc/cleandata_qc/atgc/.*\.xls", "xls", "",0,"320078"],
            [r"01.fastq_qc/cleandata_qc/qual/.*\.xls", "xls", "",0,"320079"],
            [r"01.fastq_qc/clean_data/.*\.fastq\.gz", "", "", 0, "320080"],
            [r"03.map_stat/insert/.*\.xls", "xls", "", 0, "320081"],
            [r"03.map_stat/depth/.*\.xls", "xls", "", 0, "320082"],
            [r"03.map_stat/coverage/.*\.xls", "xls", "", 0, "320083"],
            [r"03.map_stat/insert/.*\.xls", "xls", "", 0, "320084"],
            [r"05.annovar/kegg_anno/pathway_dir/.*\.pdf", "", "", 0, "320085"],
            [r"05.annovar/kegg_anno/pathway_dir/.*\.png", "", "", 0, "320086"],
            [r"06.cnv/length/.*\.length\.xls", "xls", "", 0, "320087"],
            [r"06.cnv/anno/.*\.anno\.xls", "xls", "", 0, "320088"],
            [r"06.cnv/cnv/.*\.cnv\.xls", "xls", "", 0, "320089"],
            [r"07.sv/length/.*\.length\.xls", "xls", "", 0, "320090"],
            [r"07.sv/anno/.*\.anno\.xls", "xls", "", 0, "320091"],
            [r"06.sv/sv/.*\.sv\.xls", "xls", "", 0, "320092"],
            [r"03.map_stat/map_bam/sort_bams/.*\.sort\.bam\.bai$", "", "", 0, "320093"],
            [r"03.map_stat/map_bam/sort_bams/.*\.sort\.bam$", "", "", 0, "320094"],
            [r"03.map_stat/map_bam/.*\.mkdup\.bai$", "", "", 0, "320095"],
            [r"03.map_stat/map_bam/.*\.mkdup\.bam$", "", "", 0, "320096"],
            [r"03.map_stat/map_bam/.*\.metric$", "", "", 0, "320097"],
            [r"09.circos/.*\.png$", "", "", 0, "320098"],
            [r"09.circos/.*\.pdf$", "", "", 0, "320099"],
            [r"09.circos/.*\.svg$", "", "", 0, "320100"]
        ]

        sdir = self.add_upload_dir(self.output_dir)
        sdir.add_relpath_rules(repaths)
        sdir.add_regexp_rules(regexps)

    def run_api(self):
        self.set_software()
        self.import_specimen_info()
        self.import_mapping_results()
        self.import_snp_results()
        self.import_indel_results()
        if self.is_cnvnator:
            self.import_cnv_results()
        if self.option("is_sv"):
            self.import_sv_results()
        self.import_annovar_results()
        self.import_ssr_results()
        self.import_genomic_view()
        self.import_files_paths()
        self.set_samples()
        self.send_files()

    def set_software(self):
        if self.option("snp_indel_method").lower() in ['gatk', 'sentieon']:
            self.software = '{\"method\":\"GATK\"}'
        elif self.option("snp_indel_method").lower() == 'samtools':
            self.software = '{\"method\":\"SAMtools\"}'
        elif self.option("snp_indel_method").lower() == 'freebayes':
            self.software = '{\"method\":\"FreeBayes\"}'
        elif self.option("snp_indel_method").lower() == 'sentieon':
            self.software = '{\"method\":\"Sentieon\"}'
        self.logger.info("Set the software name successfully！")

    def import_specimen_info(self):
        self.api.api('wgs_v2.background_qc').add_sg_specimen()
        self.wgs_base.update_clean_path(self.output_dir + "/01.fastq_qc/clean_data")
        if self.option("group").is_set:
            self.wgs_base.add_sg_specimen_group(self.option("group").prop['path'])
        self.api.api('wgs_v2.background_qc').add_fastp_json_stat(self._sheet.project_sn, self._sheet.id,
                                                                 self.output_dir + "/01.fastq_qc/qc_stat")

    def import_mapping_results(self):
        mapping_id = self.wgs_base.add_sg_mapping()
        self.wgs_base.add_sg_mapping_detail(mapping_id,
                                            self.output_dir + "/03.map_stat/result.stat/Total.mapped.detail.xls")
        self.wgs_base.insert_sg_mapping_curve(self.output_dir + "/03.map_stat/insert", mapping_id, "insert")
        self.wgs_base.insert_sg_mapping_curve(self.output_dir + "/03.map_stat/depth", mapping_id, "dep")
        coverage_windows = self.api.api('dna_evolution.coverage_window')
        coverage_windows.project_type = "dna_wgs_v2"
        windows_id = coverage_windows.add_sg_coverage_window({"step_num": 100000, "submit_location": "coverage_window",
                                                              "task_type": 2, "file_id": str(mapping_id)}, mapping_id)
        coverage_windows.get_sample(self.output_dir + "/03.map_stat/coverage/", windows_id)
        self.api_base.update_db_record("sg_mapping", {'_id': mapping_id},
                                       {"dep_path": self.output_dir + "/03.map_stat/map_bam/sort_bams/"})

    def import_snp_results(self):
        self.api.del_api("dna_evolution.evolution_base")
        snp_api = self.api.api('dna_evolution.evolution_base')
        snp_api.project_type = "dna_wgs_v2"
        self.call_id = snp_api.add_variant_call(self._sheet.project_sn, self._sheet.id, params=self.software)
        snp_api.add_sg_snp_call_stat(self.call_id, self.output_dir + "/04.snp_indel/variant_stat/snp.stat")
        snp_api.add_snp_qc_curve(self._sheet.id, self.call_id,
                                 self.output_dir + "/04.snp_indel/variant_stat/snp.GQ", "snp_qc", "snp_qc")
        snp_api.add_snp_qc_curve(self._sheet.id, self.call_id,
                                 self.output_dir + "/04.snp_indel/variant_stat/snp.depth", "snp_depth", "snp_depth")
        self.anno_id = snp_api.add_sg_variant_anno(self._sheet.project_sn, self._sheet.id,
                                                   params='{\"method\":\"SNPEff\"}')
        snp_api.add_sg_snp_anno_stat(self.anno_id, self.output_dir + "/04.snp_indel/anno_stat/snp.stat",
                                     "annotation")
        snp_api.add_sg_snp_anno_stat(self.anno_id, self.output_dir + "/04.snp_indel/anno_stat/snp.stat", "effect")
        snp_api.add_sg_snp_anno_bar(self._sheet.id, self.anno_id,
                                    self.output_dir + "/04.snp_indel/anno_stat/snp.stat")
        wgsv2_base = self.api.api('wgs_v2.wgsv2_base')
        wgsv2_base.add_sg_snp_replace_bar(self._sheet.id, self.call_id,
                                          self.output_dir + "/04.snp_indel/variant_stat/snp_type_distribution.txt")

    def import_indel_results(self):
        self.api.del_api("dna_evolution.evolution_base")
        indel_api = self.api.api('dna_evolution.evolution_base')
        indel_api.project_type = "dna_wgs_v2"
        indel_api.add_sg_indel_call_stat(self.call_id, self.output_dir + "/04.snp_indel/variant_stat/indel.stat")
        wgsv2_base = self.api.api('wgs_v2.wgsv2_base')
        wgsv2_base.add_sg_indel_gene(self._sheet.id, self.call_id,
                                     self.output_dir + "/04.snp_indel/variant_stat/indel_gene_distribution.txt",
                                     self.output_dir + "/04.snp_indel/variant_stat/indel.len")
        indel_api.add_indel_qc_curve(self._sheet.id, self.call_id,
                                     self.output_dir + "/04.snp_indel/variant_stat/indel.GQ", "indel_qc")
        indel_api.add_indel_qc_curve(self._sheet.id, self.call_id,
                                     self.output_dir + "/04.snp_indel/variant_stat/indel.depth", "indel_depth")
        indel_api.add_sg_indel_anno_stat(self.anno_id, self.output_dir + "/04.snp_indel/anno_stat/indel.stat",
                                         "annotation")
        indel_api.add_sg_indel_anno_stat(self.anno_id, self.output_dir + "/04.snp_indel/anno_stat/indel.stat",
                                         "effect")
        indel_api.add_sg_indel_anno_bar(self._sheet.project_sn, self._sheet.id, self.anno_id,
                                        self.output_dir + "/04.snp_indel/anno_stat/indel.stat")

    def import_cnv_results(self):
        cnv_api = self.api.api('wgs.cnv')
        cnv_api.project_type = "dna_wgs_v2"
        params = json.dumps({"method": "CNVnator", "task_type": 2, "submit_location": "cnvcall",
                             "task_id": self._sheet.id, "chongmingming_result": ''},
                            sort_keys=True, separators=(',', ':'))
        call_id = cnv_api.add_sg_cnv_call(self._sheet.project_sn, self._sheet.id, params=params)
        cnv_api.add_sg_cnv_call_stat(call_id, self.output_dir + "/06.cnv/cnv.stat.xls")
        cnv_api.add_cnv_length_bar(self._sheet.id, call_id, self.output_dir + "/06.cnv/length")

    def import_sv_results(self):
        params = json.dumps({"method": "Delly", "task_type": 2, "submit_location": "svcall",
                             "task_id": self._sheet.id, "chongmingming_result": ''},
                            sort_keys=True, separators=(',', ':'))
        sv_api = self.api.api("wgs_v2.sv_call")
        call_id = sv_api.add_sg_sv_call(self._sheet.project_sn, self._sheet.id, params=params)
        sv_api.add_sg_sv_call_stat(call_id, self.output_dir + "/07.sv/sv_stat_v2/stat.txt")
        sv_api.add_sg_sv_len(call_id, self._sheet.id, self.output_dir + "/07.sv/sv_stat_v2/")

    def import_annovar_results(self):
        anno_api = self.api.api("wgs_v2.region_anno")
        anno_api.project_type = "dna_wgs_v2"
        anno_id = anno_api.add_sg_region_anno(self._sheet.project_sn, self._sheet.id)
        pop_summary_path = self.output_dir + "/05.annovar/anno_count/pop.summary"
        go_stat_detail = self.output_dir + "/05.annovar/anno_count/pop.go.stat"
        kegg_stat_detail = self.output_dir + "/05.annovar/anno_count/pop.kegg.stat"
        eggnog_stat_detail = self.output_dir + "/05.annovar/anno_count/pop.eggnog.stat"
        go_summary_path = self.output_dir + "/05.annovar/go_summary/pop.2.enrich"
        pfam_stat_detail = self.output_dir + "/05.annovar/anno_count/pop.pfam.stat"
        origin_path = self.output_dir + "/05.annovar/kegg_anno/pathway_dir"
        pathway_dir = self.target_dir + "/05.annovar/kegg_anno/pathway_dir/"
        anno_api.add_sg_region_anno_detail(anno_id, pop_summary_path, self.genome_version_id)
        self.api_base.update_db_record("sg_region_anno", {"_id": anno_id},
                                       {"pop_summary": self.target_dir + "/05.annovar/anno_count/pop.summary"})
        anno_api.sg_region_anno_go_stat(anno_id, go_stat_detail, go_summary_path)
        anno_api.sg_region_anno_kegg_stat(anno_id, kegg_stat_detail, pathway_dir, origin_path)
        anno_api.sg_region_anno_eggnog_stat(anno_id, eggnog_stat_detail)
        if os.path.exists(pfam_stat_detail):
            anno_api.sg_region_anno_pfam_stat(anno_id, pfam_stat_detail)

    def import_ssr_results(self):
        ssr_api = self.api.api("wgs_v2.ssr_specimen")
        ssr_id = ssr_api.add_sg_ssr_marker(self._sheet.project_sn, self._sheet.id)
        ssr_api.add_sg_ssr_marker_stat(self._sheet.id, ssr_id, self.output_dir + "/08.ssr/ssr.stat")
        wgsv2_base = self.api.api('wgs_v2.wgsv2_base')
        wgsv2_base.add_sg_results(self._sheet.project_sn, self._sheet.id,
                                  self.output_dir + "/05.annovar/combine_variants/snp_indel_num.txt")
        wgsv2_base.sg_software(self._sheet.project_sn, self._sheet.id, self.option("snp_indel_method").lower())
        wgsv2_base.import_origin_vcf(self._sheet.id, self._sheet.project_sn,
                                     self.target_dir + "/05.annovar/combine_variants/pop.final.vcf")

    def import_genomic_view(self):
        circos_api = self.api.api("wgs_v2.circos")
        png = self.target_dir.rstrip('/') + "/09.visualization/01.circos/circos.png"
        svg = self.target_dir.rstrip('/') + "/09.visualization/01.circos/circos.svg"
        circos_api.add_sg_origin_circos(self._sheet.id, '2', 'circos', self.chromosome, 1, self.variant,
                                        self._sheet.project_sn, png, svg,
                                        self.genomefile_path.rstrip('/') + "/total.chrlist")
        chr_api = self.api.api("wgs_v2.chromosome_distribution")
        main_id = chr_api.add_sg_marker_distribution(self._sheet.project_sn, self._sheet.id,
                                                     {"marker_type": "SNP+InDel", "data_type": "before",
                                                      "win_step": "500000000", "analysis_object": "all",
                                                      "graphic_style": "heatmap", "task_type": 2,
                                                      'submit_location': "chr_distributon", "task_id": self._sheet.id,
                                                      "chongmingming_result": ""})
        chr_api.add_sg_distribution_detail(main_id, self.output_dir + "/09.visualization/02.chrdistribut"
                                                                      "ion/win_500000_result.txt",
                                           self._sheet.project_sn, self._sheet.id,
                                           self.chrdistribution.work_dir + "/chr_start.txt")

    def import_files_paths(self):
        file_paths = {
            "go_summary_path": self.target_dir + "/05.annovar/go_summary/pop.2.enrich",
            "bam_path": self.target_dir + "/03.map_stat/map_bam/sort_bams/",
            "indel_anno_vcf": self.target_dir + "/04.snp_indel/eff/indel.anno.primary.vcf",
            "snp_anno_vcf": self.target_dir + "/04.snp_indel/eff/snp.anno.primary.vcf",
            "pop_final_vcf": self.target_dir + "/05.annovar/combine_variants/pop.final.vcf",
            "cnv_anno_path": self.target_dir + "/06.cnv/anno/" if self.is_cnvnator else '',
            "pop_sv_vcf": self.target_dir + "/07.sv/bcftools_convert/pop.sort.sv.vcf" if self.option("is_sv") else '',
            "genome_version_id": ObjectId(self.genome_version_id),
            "region": self.region,
            "pop_ssr_vcf": "",
            "raw_data_path": self.raw_data_path
        }
        self.api_base.update_db_record("sg_task", {"task_id": self._sheet.id}, file_paths)

    def set_samples(self):
        samples = self.wgs_base.find_all_sample()
        with open(self.output_dir + "/info.list", "w") as w:
            w.write("PID\t{}\n".format(samples))
            w.write("BID\t{}\n".format(samples))

    def end(self):
        self.run_api()
        super(WgsV2Workflow, self).end()

    def get_target_dir(self):
        self.target_dir = self._sheet.output.rstrip('/')
        self.region = self._sheet.output.split('://')[0]
        if self._sheet.options()['in_fastq'].startswith("/mnt"):
            self.raw_data_path = self._sheet.options()['in_fastq']
        else:
            self.raw_data_path = self.get_wgs_path()

    def get_wgs_path(self):
        file_path = self.work_dir + "/remote_input/in_fastq/mapping_file.txt"
        if not os.path.exists(file_path):
            raise Exception("file:{} is not exists!")
        with open(file_path, 'r') as r:
            data = r.readlines()[0]
            json_data = json.loads(data)
        temp_path = os.path.dirname(json_data['in_fastq'][0]["file_path"].rstrip('/'))
        return temp_path

    def remove_file(self):
        rm_list = list()
        rm_list.append(self.output_dir + "/04.snp_indel/eff/indel.anno.csv")
        rm_list.append(self.output_dir + "/04.snp_indel/eff/indel.anno.genes.txt")
        rm_list.append(self.output_dir + "/04.snp_indel/eff/snp.anno.csv")
        rm_list.append(self.output_dir + "/04.snp_indel/eff/snp.anno.genes.txt")
        rm_list.append(self.output_dir + "/04.snp_indel/vcf_filter")
        rm_list.append(self.output_dir + "/04.snp_indel/vcf_call")
        rm_list.append(self.output_dir + "/01.fastq_qc/clean_data")
        for files in rm_list:
            if os.path.isfile(files):
                os.remove(files)
            elif os.path.isdir(files):
                code = os.system("rm -r {}".format(files))
                if code != 0:
                    self.logger.info("Delete folder {} failed！".format(files))
            else:
                self.logger.info("File {} does not exist！".format(files))

    def is_cnvnator_set(self, total_chrlist=None):
        chrmax = 50000
        if self.option("is_cnv"):
            if self.has_genome:
                chrnum = len(open(total_chrlist, 'rU').readlines())
                if chrnum < chrmax:
                    self.is_cnvnator = True
            else:
                chrnum = 0
                with open(self.option("genome_info").prop['path'].rstrip('/') + "/ref.fa", 'r') as r:
                    for line in r:
                        if re.match('>.*', line):
                            chrnum += 1
                if chrnum < chrmax:
                    self.is_cnvnator = True

    def set_chromosome(self, ref_chrlist):
        chr_list = []
        sca_list = []
        with open(ref_chrlist, 'r') as r:
            for line in r:
                item = line.strip().split("\t")
                if item[0].lower().startswith("chr"):
                    if item[0] not in chr_list:
                        chr_list.append(item[0])
                else:
                    if item[0] not in sca_list:
                        sca_list.append(item[0])
        if chr_list:
            self.chromosome = ','.join(chr_list)
        else:
            self.chromosome = ','.join(sca_list[:15])

    def set_call_type(self, ref_chrlist):
        self.call_type = 'sentieon' if self.option("snp_indel_method").lower() == 'gatk' \
            else self.option("snp_indel_method").lower()
        with open(ref_chrlist, 'r') as r:
            data = r.readlines()
            for line in data:
                temp = line.strip().split('\t')
                if int(temp[1]) > 536870912:
                    self.call_type = 'samtools'
                    self.large_genome = "true"
                    self.bam_list = self.mapping.output_dir + "/bam.list"
                    break
        self.logger.info("call type is {}--large_genome is {}".format(self.call_type, self.large_genome))

    def set_ref_info(self, is_update=False):
        if is_update:
            wgs_refinfo = self.api.api('wgs.ref_info')
            wgs_refinfo.project_type = "dna_wgs_v2"
            wgs_refinfo.add_sg_genome(self.genome_config.output_dir + "/wgs_genome.json")
            base_path = self.json_path + self.species_path
            self.ref = base_path + '/ref.fa'
            self.gff = base_path + "/ref.gff"
            self.anno = base_path + "/anno.summary"
            self.ref_dict = base_path + "/ref.dict"
            self.snpeff_path = base_path + "/snpEff.config"
            ref_chrlist = base_path + "/ref.chrlist"
            ssr_path = base_path
            ref_changelog = base_path + "/ref.changelog"
            ref_log = base_path + "/info.log"
            self.anno_summary = base_path + "/anno.summary"
            self.genome_version_id = wgs_refinfo.find_genome_id(self.species, self.genome_version)
            if self.secret:
                wgs_refinfo.update_secret(self.genome_version_id)
        else:
            self.ref, self.gff, self.anno, self.ref_dict, self. \
                snpeff_path, ref_chrlist, ssr_path, ref_changelog, ref_log, self.chr_set, self.anno_summary = \
                self.evolution_base.set_ref(self.json_path, self.genome_version_id)
        os.system("mkdir " + self.output_dir + "/02.reference")
        os.system("mkdir " + self.output_dir + "/08.ssr")
        self.os_link(ref_chrlist, self.output_dir + "/02.reference/ref.chrlist")
        self.os_link(self.ref, self.output_dir + "/02.reference/ref.fa")
        self.os_link(ref_log, self.output_dir + "/02.reference/info.log")
        self.os_link(ref_changelog, self.output_dir + "/02.reference/ref.changelog")
        self.os_link(ssr_path.rstrip('/') + "/ref.gff", self.output_dir + "/02.reference/ref.gff")
        self.os_link(ssr_path.rstrip('/') + "/anno.summary", self.output_dir + "/02.reference/anno.summary")
        self.os_link(ssr_path.rstrip('/') + "/ssr.stat", self.output_dir + "/08.ssr/ssr.stat")
        self.os_link(ssr_path.rstrip('/') + "/ssr.ref.result.xls", self.output_dir + "/08.ssr/ssr.ref.result.xls")
        self.set_call_type(ref_chrlist)
        self.is_cnvnator_set(ssr_path.rstrip('/') + "/total.chrlist")
        self.set_chromosome(ref_chrlist)
        self.genomefile_path = ssr_path

    def os_link(self, source, target):
        if os.path.exists(target):
            os.remove(target)
        os.link(source, target)
        self.logger.info("Move {} to {} successful！".format(source, target))

    def set_circos_params(self, gff, snp_vcf, sv_path, cnv_path):
        wgsv2_base = self.api.api('wgs_v2.wgsv2_base')
        self.circos_sample = wgsv2_base.find_one_sample(self._sheet.id)
        self.variant = [
                        {"analysis_object": self.circos_sample, "style": "histogram", "type": "before",
                         "variant": "snp", "win_step": "10000", "pwd": snp_vcf},
                        {"analysis_object": self.circos_sample, "style": "scatter", "type": "before",
                         "variant": "indel", "win_step": "10000", "pwd": snp_vcf}]
        if self.option("is_sv"):
            self.variant.append({"analysis_object": self.circos_sample, "style": "line", "type": "before",
                                 "variant": "sv", "win_step": "100000", 'pwd': sv_path})
        if self.is_cnvnator:
            self.variant.append({"analysis_object": self.circos_sample, "style": "heatmap", "type": "before",
                                 "variant": "cnv", "win_step": "100000",
                                 'pwd': cnv_path + "{}.cnv.anno.xls".format(self.circos_sample)})
