import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyDataSourceOptions, MyQuery } from './types';
import { Observable, of } from 'rxjs';

// SineWaveDataSource implements the data source API for Grafana.
export class SineWaveDataSource extends DataSourceApi<MyQuery, MyDataSourceOptions, {}> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  // Implement the importQueries method to satisfy the base type.
  async importQueries(queries: MyQuery[]): Promise<MyQuery[]> {
    // Simply return the queries as is. Transform them if needed.
    return queries;
  }

  // The query method returns an observable directly.
  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const { range, targets } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Create a data frame with a time field and a numeric value field.
    const frame = new MutableDataFrame({
      refId: targets[0].refId, // Assuming at least one target exists
      fields: [
        { name: 'time', type: FieldType.time },
        { name: 'value', type: FieldType.number },
      ],
    });

    // Generate sine wave data over the given time range.
    const duration = to - from;
    const step = duration / 1000;
    for (let t = 0; t < duration; t += step) {
      frame.add({ time: from + t, value: Math.sin((2 * Math.PI * t) / duration) });
    }

    // Return the data wrapped in an observable.
    return of({ data: [frame] });
  }

  // testDatasource is used by Grafana to test connectivity.
  async testDatasource() {
    return {
      status: 'success',
      message: 'Sine Wave Data Source is working',
    };
  }
}