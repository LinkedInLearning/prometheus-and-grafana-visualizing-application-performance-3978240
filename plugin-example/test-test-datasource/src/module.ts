import { DataSourcePlugin } from '@grafana/data';
import { SineWaveDataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<SineWaveDataSource, MyQuery, MyDataSourceOptions>(SineWaveDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
