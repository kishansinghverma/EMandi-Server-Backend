import { MongoClient } from "mongodb";
import 'dotenv/config';

export const constants = {
    database: 'E-Mandi',
    collections: {
        queued: 'Queued',
        processed: 'Processed',
        parties: 'Parties',
        transactions: 'Transactions'
    },
    errors: {
        invalidJson: 'Bad Request: Invalid JSON',
        missingParams: 'Bad Request: Parameters Missing',
        duplicateRecord: 'Bad Request: Duplicate Record'
    }
};

export const getClientWithCollection = (collectionName) => {
    const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
    const database = client.db(constants.database);
    const collection = database.collection(collectionName);
    return [client, collection];
};

export const getDocument = async (collectionName, query, options) => {
    const [client, collection] = getClientWithCollection(collectionName);
    console.log('fetching data...');
    try {
        const data = await collection.findOne(query, options);
        console.log(data);
        return { content: data, statusCode: data ? 200 : 404 };
    }
    catch (err) {
        logError(err);
        return { content: err.message, statusCode: 500 };
    }
    finally {
        await client.close();
    }
};

export const getDocuments = async (collectionName, query, options) => {
    const [client, collection] = getClientWithCollection(collectionName);
    try {
        const response = await collection.find(query, options).toArray();
        return { content: response, statusCode: 200 };
    }
    catch (err) {
        logError(err);
        return { content: err.message, statusCode: 500 };
    }
    finally {
        await client.close();
    }
};

export const insertDocument = async (collectionName, document) => {
    const [client, collection] = getClientWithCollection(collectionName);
    try {
        const { insertedId } = await collection.insertOne(document);
        return { content: { insertedId }, statusCode: 201 };
    }
    catch (err) {
        logError(err);
        return { content: err.message, statusCode: 500 };
    }
    finally {
        await client.close();
    }
};

export const insertUniqueDocument = async (collectionName, document, matchQuery) => {
    const [client, collection] = getClientWithCollection(collectionName);
    try {
        const searchResult = await collection.findOne(matchQuery);
        if (searchResult) {
            return { content: constants.errors.duplicateRecord, statusCode: 409 };
        }
        else {
            const { insertedId } = await collection.insertOne(document);
            return { content: { insertedId }, statusCode: 201 };   
        }
    }
    catch (err) {
        logError(err);
        return { content: err.message, statusCode: 500 };
    }
    finally {
        await client.close();
    }
};

export const deleteDocument = async (collectionName, recordId) => {
    const [client, collection] = getClientWithCollection(collectionName);
    try {
        const { deletedCount } = await collection.deleteOne({ _id: recordId });
        return { content: { deletedCount }, statusCode: 200 };
    }
    catch (err) {
        logError(err);
        return { content: err.message, statusCode: 500 };
    }
    finally {
        await client.close();
    }
};

export const updateDocument = async (collectionName, documentId, patchData) => {
    const [client, collection] = getClientWithCollection(collectionName);
    try {
        const { modifiedCount } = await collection.updateOne({ _id: documentId }, { $set: patchData });
        return { content: { modifiedCount }, statusCode: 200 };
    }
    catch (err) {
        logError(err);
        return { content: err.message, statusCode: 500 };
    }
    finally {
        await client.close();
    }
};

export const getEpoch = () => new Date().getTime();

export const handleJsonError = (err, req, res, next) => {
    if (err instanceof SyntaxError) {
        logError(err);
        res.status(400).send(constants.errors.invalidJson);
    } else {
        next(err);
    }
};

export const logError = (err) => {
    console.error('\n*---------* Handled Exception *---------*');
    console.log(err.stack);
    console.error('*---------------------------------------*\n');
};