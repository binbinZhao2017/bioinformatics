# -*- coding: utf-8 -*-
# __author__ = 'binbin.zhao'

from api_base import ApiBase
from bson.objectid import ObjectId
import os
import pandas as pd


class Regression(ApiBase):
    def __init__(self, bind_object):
        super(Regression, self).__init__(bind_object)

    def add_regression(self, main_id, output_dir, input_dir):
        if os.path.exists(os.path.join(output_dir, 'group.xls')):
            group_file = os.path.join(output_dir, 'group.xls')
            group = pd.read_table(group_file)
            origin = pd.read_table(input_dir)
            target = pd.merge(origin, group, on='Name')
            target.to_csv(os.path.join(output_dir, 'regression_data_group.xls'), sep='\t', index=0)

            target_file = os.path.join(output_dir, 'regression_data_group.xls')
            result = pd.read_table(target_file, header=0)
            sample_dict_list = result.to_dict('records')
        else:
            target_file = os.path.join(input_dir)
            result = pd.read_table(target_file, header=0)
            sample_dict_list = result.to_dict('records')

        site_file = os.path.join(output_dir, 'regression_data.xls')
        result = pd.read_table(site_file)
        site_dict_list = result.to_dict('records')

        main_id = ObjectId(main_id)
        self.col_insert_data('sg_regression_detail', sample_dict_list)
        self.col_insert_data('sg_regression_data_detail', site_dict_list)

        target_file = os.path.join(output_dir, 'regression_message.xls')
        with open(target_file, 'rb') as r:
            i = 0
            for line in r:
                if i == 0:
                    i = 1
                else:
                    line = line.strip('\n')
                    line_data = line.split('\t')
                    line_d = ''
                    if float('%.3f' % float(line_data[6])) > 0:
                        line_d = 'y=' + str('%.3f' % float(line_data[5])) + 'x+' + str('%.3f' % float(line_data[6]))
                    elif float('%.3f' % float(line_data[6])) < 0:
                        line_d = 'y=' + str('%.3f' % float(line_data[5])) + 'x' + str('%.3f' % float(line_data[6]))
                    elif float('%.3f' % float(line_data[6])) == 0.000:
                        line_d = 'y=' + str('%.3f' % float(line_data[5])) + 'x'
                    R_2 = '%.2f' % float(line_data[0])
                    xmin = line_data[1]
                    ymin = line_data[2]
                    xmax = line_data[3]
                    ymax = line_data[4]
                    regression_equation = line_d
        try:
            self.db['sg_regression'].update_one({'_id': main_id}, {'$set': {'status': 'end', 'R_2': R_2, 'xmin':xmin,
                                                                               'ymin': ymin, 'xmax': xmax, 'ymax': ymax,
                                                                               'regression_equation': regression_equation,
                                                                                'scatter_dir': input_dir}})
        except:
            self.bind_object.logger.info("Update regression successfully!")
        else:
            self.bind_object.logger.info("regression update failed!")



#if __name__ == '__main__':
#    a = Regression(None)
#    output_dir = '/mnt/ilustre/users/sanger-dev/workspace/20190821/Single_regression20190821111836/Regression1/output'
#    a.add_regression(output_dir=output_dir)
