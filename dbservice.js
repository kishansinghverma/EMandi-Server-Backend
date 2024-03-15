import { constants, deleteDocument, getDocument, getDocuments, getEpoch, insertDocument, insertUniqueDocument, updateDocument } from "./utils.js";

export const queueRecord = (record) => insertDocument(constants.collections.queued, { ...record, createdOn: getEpoch() });

export const peekRecord = () => getDocument(constants.collections.queued, {}, { sort: { createdOn: 1 } });

export const getQueued = () => getDocuments(constants.collections.queued, {}, { sort: { createdOn: 1 } });

export const getProcessed = () => getDocuments(constants.collections.processed, {}, { sort: { createdOn: 1 } });

export const getTransactions = () => getDocuments(constants.collections.transactions, {}, { sort: { createdOn: 1 } })

export const getParties = () => getDocuments(constants.collections.parties, {}, { sort: { name: 1 } });

export const deleteRecord = (recordId) => deleteDocument(constants.collections.queued, recordId);

export const addParty = async (party) => {
    const query = { name: party.name, mandi: party.mandi, stateCode: party.stateCode };
    return insertUniqueDocument(constants.collections.parties, party, query);
}

export const requeueRecord = async (recordId) => {
    const searchResult = await getDocument(constants.collections.processed, { _id: recordId }, {});
    if (searchResult.statusCode === 200) {
        await insertDocument(constants.collections.queued, searchResult.content);
        await deleteDocument(constants.collections.processed, searchResult.content._id);
    }
    return searchResult;
};

export const popRecord = async () => {
    const searchResult = await peekRecord();
    if (searchResult.statusCode === 200) {
        await insertDocument(constants.collections.processed, searchResult.content);
        await deleteDocument(constants.collections.queued, searchResult.content._id);
    }
    return searchResult;
};

export const updateRecordAtHead = async (patchData) => {
    const searchResult = await peekRecord();
    if (searchResult.statusCode === 200) {
        const { finalize, ...restUpdates } = patchData;
        searchResult.content = { ...searchResult.content, restUpdates };
        await updateDocument(constants.collections.queued, searchResult.content._id, restUpdates);
        if (finalize) {
            await insertDocument(constants.collections.processed, searchResult.content);
            await deleteDocument(constants.collections.queued, searchResult.content._id);
        }
    }
    return searchResult;
};