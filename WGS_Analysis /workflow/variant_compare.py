# -*- coding: utf-8 -*-
# __author__ = 'Binbin Zhao'
# modified 20190304

import os
import json
import re
import gevent
from biocluster.workflow import Workflow
from biocluster.core.exceptions import OptionError


class VariantCompareWorkflow(Workflow):
    """
    variant compare analysis
    """

    def __init__(self, wsheet_object):
        self._sheet = wsheet_object
        super(VariantCompareWorkflow, self).__init__(wsheet_object)
        options = [
            {"name": "sample", "type": "string"},
            {"name": "genotype", "type": "string"},
            {"name": "group", "type": "string"},
            {"name": "marktype", "type": "string"},
            {"name": "vcf_file", "type": "string"},
            {"name": "dep", "type": "string"},
            {"name": "maf", "type": "string"},
            {"name": "ad", "type": "string"},
            {"name": "max_miss", "type": "string"},
            {"name": "update_info", "type": "string"},
            {"name": "task_id", "type": "string"},
            {"name": "main_id", "type": "string"},
            {"name": "project_sn", "type": "string"},
            {"name": "analysis_model", "type": "string"},  # single or multiple
            {"name": "alle_number", "type": "string"},
            {"name": "eff_type", "type": "string"},
            {"name": "region", "type": "string"},
            {"name": "variant_type", "type": "string"},
            {"name": "region_type", "type": "string"},

          ]
        self.add_option(options)
        self.set_options(self._sheet.options())
        self.group_path = ""

    def check_options(self):
        if not self.option("vcf_file"):
            raise OptionError("Missing vcf_file parameters", code="15500109")

    def get_config(self):

        os.mkdir(self.work_dir + "/config_file")
        if os.path.exists(os.path.join(self.work_dir + "/config_file", "diff.config")):
            os.remove(os.path.join(self.work_dir + "/config_file", "config.txt"))
        if self.option("analysis_model") == "single":
            sample = json.loads(self.option("sample"))
            for s in sample:
                try:
                    sample1 = s.strip().split("|")[0]
                    sample2 = s.strip().split("|")[1]
                except:
                    self.set_error("Input format of Sample is incorrect!")
                with open(os.path.join(self.work_dir + "/config_file", sample1 + "_vs_" + sample2 + "_compare"), "w") \
                        as w:
                    w.write("Variant Type=" + self.option("variant_type") + "\n")
                    w.write("Variant Eff=" + self.option("eff_type") + "\n" )
                    w.write("allele_num=" + self.option("alle_number") + "\n")
                    if self.option("region_type") == "allregion":
                        w.write("Region=" + self.option("region") + "\n")
                    elif self.option("region_type") == "custom":
                        region_list = json.loads(self.option("region"))
                        for region in region_list:
                            w.write("Region=" + region + "\n")
                    elif self.option("region_type") == "location":
                        region_list1 = json.loads(self.option("region"))
                        self.logger.info(type(region_list1))
                        for region1 in region_list1:
                            w.write("Region=" + region1 + "\n")
                    min_dep = self.option("dep").strip().split(",")[0]
                    max_dep = self.option("dep").strip().split(",")[1]
                    if max_dep == "":
                        max_dep = 100000
                    w.write("Sample Diff=" + sample1 + "," + str(min_dep) + "," + str(max_dep) + "," +
                            self.option("genotype") + "," +
                            sample2 + "," + str(min_dep) + "," + str(max_dep) + "," + self.option("genotype") + "," +
                            self.option("marktype"))

        else:
            with open(os.path.join(self.work_dir, "diff.config"), "w") as w:
                w.write("Variant Type=" + self.option("variant_type") + "\n")
                w.write("Variant Eff=" + self.option("eff_type") + "\n")
                w.write("allele_num=" + self.option("alle_number") + "\n")
                if self.option("region_type") == "allregion":
                    w.write("Region=" + self.option("region") + "\n")
                elif self.option("region_type") == "custom":
                    region_list = json.loads(self.option("region"))
                    for region in region_list:
                        w.write("Region=" + region + "\n")
                elif self.option("region_type") == "location":
                    region_list1 = json.loads(self.option("region"))
                    for region1 in region_list1:
                        w.write("Region=" + region1 + "\n")
                sample = json.loads(self.option("sample"))
                if not sample == [""]:
                    dep = json.loads(self.option("dep"))
                    genotype = json.loads(self.option("genotype"))
                    is_same = json.loads(self.option("marktype"))
                    for (x, y, z, m)in zip(sample, dep, genotype, is_same):
                        try:
                            sample1 = x.strip().split("|")[0]
                            sample2 = x.strip().split("|")[1]
                        except BaseException:
                            self.set_error("Input format of Sample is incorrect!")
                        try:
                            dep1_min = y.strip().split(
                                "|")[0].strip().split("-")[0]
                            dep1_max = y.strip().split(
                                "|")[0].strip().split("-")[1]
                            dep2_min = y.strip().split(
                                "|")[1].strip().split("-")[0]
                            dep2_max = y.strip().split(
                                "|")[1].strip().split("-")[1]
                            self.logger.info(dep1_min)
                            self.logger.info(dep1_max)
                            if float(dep1_min) < 0:
                                self.set_error("Deep information should be Positive integer！")
                            if dep1_max == "":
                                dep1_max = 100000
                            elif float(dep1_max) < 0:
                                self.set_error("Deep information should be Positive integer！")
                            if float(dep2_min) < 0:
                                self.set_error("Deep information should be Positive integer！")
                            if dep2_max == "":
                                dep2_max = 100000
                            elif float(dep2_max) < 0:
                                self.set_error("Deep information should be Positive integer！")
                        except BaseException:
                            self.set_error("Input format of Deep information is incorrect！")
                        try:
                            genetype_1 = z.strip().split("|")[0]
                            genetype_2 = z.strip().split("|")[1]
                        except:
                            self.set_error("Input format of genotype is incorrect！！")
                        w.write("Sample Diff=" + sample1 + "," + str(dep1_min) + "," + str(dep1_max) + "," + genetype_1 + "," +
                                sample2 + "," + str(dep2_min) + "," + str(dep2_max) + "," +
                            genetype_2 + "," + m + "\n")

                group = json.loads(self.option("group"))
                ad = json.loads(self.option("ad"))
                miss = json.loads(self.option("max_miss"))
                maf = json.loads(self.option("maf"))
                for (x, y, z, m) in zip(group, ad, miss, maf):
                    try:
                        group_split = x.strip().split(":")[0]
                    except BaseException:
                        self.set_error("Input format of group is incorrtct！")
                    try:
                        ad_min = y.strip().split("-")[0]
                        ad_max = y.strip().split("-")[1]
                        if ad_min < 0 and not isinstance(ad_min, int):
                            self.set_error("Average deep information should be Positive integer！")
                        if ad_max < 0 and not isinstance(ad_max, int):
                            self.set_error("Average deep information should be Positive integer！")
                        elif ad_max == "":
                            ad_max = 100000
                    except BaseException:
                        self.set_error("Average deep information should be Positive integer！")
                    if float(z) > 1 or float(z) < 0:
                        self.set_error("The maximum missing rate should be between 0 and 1！")
                    try:
                        maf_min = m.strip().split("-")[0]
                        maf_max = m.strip().split("-")[1]
                        if float(maf_min) > 1 and float(maf_max) < 0:
                            self.set_error("The average frequency should be between 0 and 1！")
                        if float(maf_max) > 1 or float(maf_max) < 0:
                            self.set_error("The average frequency should be between 0 and 1！")
                    except BaseException:
                        self.set_error("Input format of the average frequency is incorrects！")
                    w.write("Group Info=" + group_split + "," + str(ad_min) + "," + str(ad_max) + "," + z + "," + str(maf_min) + "," +
                            str(maf_max) + "\n")

    def get_group_path(self):

        if not self.option("group") or json.loads(self.option("group")) == []:
            if os.path.exists(os.path.join(self.work_dir, "group_new.txt")):
                os.remove(os.path.join(self.work_dir, "group_new"))
            with open(os.path.join(self.work_dir, "group_new"), "w") as w:
                w.write("None:None")
            self.group_path = os.path.join(self.work_dir, "group_new")
        else:
            if os.path.exists(os.path.join(self.work_dir, "group_new.txt")):
                os.remove(os.path.join(self.work_dir, "group_new"))
            group1 = {}
            with open(os.path.join(self.work_dir, "group_new"), "w") as w:
                for i in json.loads(self.option("group")):
                    if i.strip().split(":")[0] not in group1.keys():
                        group1[i.strip().split(":")[0]] = []
                        group1[i.strip().split(":")[0]] = i.strip().split(":")[1]
                for j in group1.keys():
                    sample_list1 = group1[j]
                    w.write(j + ":" + sample_list1 + "\n")
            self.group_path = os.path.join(self.work_dir, "group_new")
            return self.group_path

    def run_variant_compare(self):
        if self.option("analysis_model") == "single":
            self.variant_compare_tools = []
            config_file = os.listdir(self.work_dir + "/config_file")
            for config in config_file:
                variant_compare = self.add_tool("wgs_v2.variant_compare")
                variant_compare.set_options(
                    {
                        "filter_recode_vcf": self.option("vcf_file"),
                        "variant_compare_config": os.path.join(self.work_dir + "/config_file", config),
                        "group_table": self.group_path,
                        "name": config,
                    }
                )
                self.variant_compare_tools.append(variant_compare)
            for j in range(len(self.variant_compare_tools)):
                self.variant_compare_tools[j].on("end", self.set_output, "variant_compare_s")
            if self.variant_compare_tools:
                if len(self.variant_compare_tools) > 1:
                    self.on_rely(self.variant_compare_tools, self.end)
                elif len(self.variant_compare_tools) == 1:
                    self.variant_compare_tools[0].on('end', self.end)
            else:
                self.set_error("variant_compare_tools为空！")
            for tool in self.variant_compare_tools:
                gevent.sleep(1)
                tool.run()

        else:
            self.variant_compare = self.add_tool("wgs_v2.variant_compare")
            options = {
                "filter_recode_vcf": self.option("vcf_file"),
                "group_table": self.group_path,
                "variant_compare_config": os.path.join(
                    self.work_dir,
                    "diff.config"),
                "name": "variant_compare",
            }
            self.variant_compare.set_options(options)
            self.variant_compare.on("end", self.set_output, "variant_compare_m")
            self.variant_compare.run()

    def set_output(self, event):
        obj = event['bind_object']
        if event['data'] == 'variant_compare_s':
            self.linkdir(obj.output_dir, self.output_dir + "/variant_compare")
        elif event['data'] == 'variant_compare_m':
            self.linkdir(obj.output_dir, self.output_dir + "/variant_compare")
            self.end()

    def linkdir(self, dirpath, dirname):
        allfiles = os.listdir(dirpath)
        newdir = os.path.join(self.output_dir, dirname)
        if not os.path.exists(newdir):
            os.mkdir(newdir)
        oldfiles = [os.path.join(dirpath, i) for i in allfiles]
        newfiles = [os.path.join(newdir, i) for i in allfiles]
        for newfile in newfiles:
            if os.path.exists(newfile):
                if os.path.isfile(newfile):
                    os.remove(newfile)
                else:
                    os.system('rm -r %s' % newfile)
                    self.logger.info('rm -r %s' % newfile)
        for i in range(len(allfiles)):
            if os.path.isfile(oldfiles[i]):
                os.link(oldfiles[i], newfiles[i])
            elif os.path.isdir(oldfiles[i]):
                self.logger.info('cp -r %s %s' % (oldfiles[i], newdir))
                os.system('cp -r %s %s' % (oldfiles[i], newdir))

    def set_db(self):
        self.logger.info("Save the results to mongo")
        api_path = self.api.api("wgs_v2.variant_compare")
        if self.option("analysis_model") == "single":
            list_vcf = []
            vcf_path = self._sheet.output + "/variant_compare/"
            path = os.listdir(self.output_dir+"/variant_compare/")
            for i in path:
                name = i.strip().split(".")[0]
                if re.match(".*detail$", i):
                    api_path.sg_varian_compare_detail(self.option("main_id"), self.output_dir + '/variant_compare/' +
                                                        i, name)
                elif re.match(".*filter\.vcf$", i):
                    list_vcf.append(vcf_path + i)
                elif re.match(".*snp_indel_stat\.txt$", i):
                    api_path.add_sg_variant_compare_stat_v2(self.option("main_id"),
                                                            self.output_dir + '/variant_compare/' + i, name)
                elif re.match(".*eff$", i):
                    api_path.add_sg_variant_compare_effect(self.option("main_id"), self.output_dir + '/variant_compare/'
                                                           + i,  name)
                    if self.option("variant_type") == "SNP,INDEL":
                        api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                               self.output_dir + '/variant_compare/' + i, name,
                                                               "all")
                        api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                                self.output_dir + '/variant_compare/' + i, name,
                                                                "snp")
                        api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                                self.output_dir + '/variant_compare/' + i, name,
                                                                "indel")
                    else:
                        api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                                self.output_dir + '/variant_compare/' + i, name,
                                                                self.option("variant_type").lower())

                elif re.match(".*func$", i):
                    api_path.add_sg_variant_compare_func(self.option("main_id"), self.output_dir + '/variant_compare/'
                                                           + i, name)
                    if self.option("variant_type") == "SNP,INDEL":
                        api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                               self.output_dir + '/variant_compare/' + i, name, "all")
                        api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                               self.output_dir + '/variant_compare/' + i, name, "snp")
                        api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                               self.output_dir + '/variant_compare/' + i, name, "indel")
                    else:
                        api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                               self.output_dir + '/variant_compare/' + i, name,
                                                               self.option("variant_type").lower())
            api_path.update_variant_compare(list_vcf, self.option("main_id"))
        else:
            api_path.sg_varian_compare_detail(self.option("main_id"),
                                              self.output_dir + '/variant_compare/variant_compare.detail',
                                              "variant_compare")
            api_path.update_variant_compare(self.output_dir+'/variant_compare/variant_compare.filter.vcf',
                                            self.option("main_id"))
            if os.path.exists(self.output_dir + '/variant_compare/variant_compare.eff'):
                api_path.add_sg_variant_compare_effect(self.option("main_id"), self.output_dir +
                                                   '/variant_compare/variant_compare.eff', "variant_compare")
            if os.path.exists(self.output_dir + '/variant_compare/variant_compare.func'):
                api_path.add_sg_variant_compare_func(self.option("main_id"), self.output_dir +
                                                 '/variant_compare/variant_compare.func', "variant_compare")
            if os.path.exists(self.output_dir + '/variant_compare/variant_compare.snp_indel_stat.txt'):
                api_path.add_sg_variant_compare_stat_v2(self.option("main_id"),
                                                        self.output_dir +
                                                        '/variant_compare/variant_compare.snp_indel_stat.txt',
                                                        "variant_compare")
            else:
                api_path.add_sg_variant_compare_stat(self.option("main_id"),
                                                     self.output_dir + '/variant_compare/variant_compare.filter.vcf',
                                                     "variant_compare")
            if self.option("variant_type") == "SNP,INDEL":
                if os.path.exists(self.output_dir + '/variant_compare/variant_compare.func'):
                    api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                           self.output_dir + '/variant_compare/variant_compare.func',
                                                           "variant_compare", "all")
                    api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                           self.output_dir + '/variant_compare/variant_compare.func',
                                                           "variant_compare", "snp")
                    api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                       self.output_dir + '/variant_compare/variant_compare.func',
                                                       "variant_compare", "indel")
                if os.path.exists(self.output_dir + '/variant_compare/variant_compare.eff'):
                    api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                            self.output_dir + '/variant_compare/variant_compare.eff',
                                                            "variant_compare", "all")
                    api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                        self.output_dir + '/variant_compare/variant_compare.eff',
                                                        "variant_compare", "snp")
                    api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                        self.output_dir + '/variant_compare/variant_compare.eff',
                                                        "variant_compare", "indel")
            else:
                if os.path.exists(self.output_dir + '/variant_compare/variant_compare.func'):
                    api_path.sg_variant_compare_impact_bar(self.option("main_id"), self.option("task_id"),
                                                       self.output_dir + '/variant_compare/variant_compare.func',
                                                       "variant_compare",
                                                       self.option("variant_type").lower())
                if os.path.exists(self.output_dir + '/variant_compare/variant_compare.eff'):
                    api_path.add_variant_compare_effect_bar(self.option("main_id"), self.option("task_id"),
                                                    self.output_dir + '/variant_compare/variant_compare.eff',
                                                    "variant_compare",
                                                    self.option("variant_type").lower())

    def file_check(self):
        files = os.listdir(self.output_dir + "/variant_compare/")
        num = 1
        for j in files:
            if re.match(".*eff$", j):
                num = 0
                break
        if num == 0:
            return True
        elif num ==1:
            return False

    def run(self):
        self.get_config()
        self.get_group_path()
        self.run_variant_compare()
        super(VariantCompareWorkflow, self).run()

    def end(self):
        gevent.sleep(1)
        self.set_db()
        result_dir = self.add_upload_dir(self.output_dir)
        result_dir.add_relpath_rules([
            [".", "", "Result output directory"],
        ])
        result_dir.add_regexp_rules([
            ["", "", ""]
        ])
        super(VariantCompareWorkflow, self).end()
