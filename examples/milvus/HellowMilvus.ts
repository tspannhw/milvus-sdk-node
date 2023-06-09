import {
  MilvusClient,
  DataType,
  InsertReq,
  ConsistencyLevelEnum,
} from '@zilliz/milvus2-sdk-node';
import {
  generateInsertData,
  genCollectionParams,
  VECTOR_FIELD_NAME,
} from '../../test/tools';

const COLLECTION_NAME = 'hello_milvus';

(async () => {
  // build client
  const milvusClient = new MilvusClient({
    address: 'localhost',
    username: 'username',
    password: 'Aa12345!!',
  });

  console.log('Node client is initialized.');

  const createParams = genCollectionParams({
    collectionName: COLLECTION_NAME,
    dim: 256,
    vectorType: DataType.FloatVector,
  });
  // // create collection
  const create = await milvusClient.createCollection(createParams);
  console.log('Create collection is finished.', create);

  // build example data
  const vectorsData = generateInsertData(createParams.fields, 10000);
  const params: InsertReq = {
    collection_name: COLLECTION_NAME,
    fields_data: vectorsData,
  };
  // insert data into collection
  await milvusClient.insert(params);
  console.log('Data is inserted.');

  // create index
  const createIndex = await milvusClient.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: VECTOR_FIELD_NAME,
    metric_type: 'L2',
  });

  console.log('Index is created', createIndex);

  // need load collection before search
  const load = await milvusClient.loadCollectionSync({
    collection_name: COLLECTION_NAME,
  });
  console.log('Collection is loaded.', load);

  // do the search
  for (let i = 0; i < 1; i++) {
    console.time('Search time');
    const search = await milvusClient.search({
      collection_name: COLLECTION_NAME,
      vector: vectorsData[i][VECTOR_FIELD_NAME],
      output_fields: ['age'],
      limit: 5,
    });
    console.timeEnd('Search time');
    console.log('Search result', search);
  }

  // drop collection
  await milvusClient.dropCollection({
    collection_name: COLLECTION_NAME,
  });
})();