import { join } from 'path'
import { LowSync, JSONFileSync } from 'lowdb'

let queued, processed, parties, transactions;

// Initialize database
// const initializeDb = () => {
//     queued = new LowSync(new JSONFileSync(join('db', 'queued.json')));
//     processed = new LowSync(new JSONFileSync(join('db', 'processed.json')));
//     parties = new LowSync(new JSONFileSync(join('db', 'parties.json')));
//     transactions = new LowSync(new JSONFileSync(join('db', 'transactions.json')));

//     for (const item of [queued, processed, parties, transactions]) {
//         try {
//             item.read();
//             if (!item.data) throw new Error('Initializing DB...');
//         }
//         catch (err) {
//             item.data = { Records: [] }
//             item.write();
//         }
//     }
// }

// export const PopRecord = () => {
//     queued.read();
//     processed.read();
//     if (queued.data.Records.length > 0) {
//         const entry = queued.data.Records[0];
//         processed.data.Records.push(entry);
//         queued.data.Records.splice(0, 1);
//         queued.write();
//         processed.write();
//         return entry;
//     }
// }

export const AddTransaction = (txnDetails) => {
    transactions.read();
    const Id = `${(new Date().getTime())}_${Math.random().toString(36).substring(2, 7)}`;
    transactions.data.Records.push({ Id, ...txnDetails, Location: txnDetails.Location.replaceAll('\n', ', ') });
    transactions.write();
}

export const GetAllTransactions = () => {
    transactions.read();
    return transactions.data.Records;
}

export const DeleteTransaction = (id) => {
    transactions.read();
    const remainingRecords = transactions.data.Records.filter((record) => record.Id != id);
    if (transactions.data.Records.length === remainingRecords.length) return 404;
    transactions.data.Records = remainingRecords;
    transactions.write();
    return 200;
}

// export const AddParty = (record) => {
//     parties.read();

//     const duplicate = parties.data.Records.find((party) =>
//         (party.Party === record.Party && party.Mandi === record.Mandi && party.StateCode === record.StateCode)
//     );

//     if (duplicate) return 409;

//     parties.data.Records.push(record);
//     parties.data.Records.sort((a, b) => {
//         let ele1 = a.Party.toLowerCase();
//         let ele2 = b.Party.toLowerCase();
//         if (ele1 < ele2) { return -1; }
//         if (ele1 > ele2) { return 1; }
//         return 0;
//     })
//     parties.write();
//     return 201;
// }

// export const PushRecord = (record) => {
//     queued.read();
//     queued.data.Records.push({ ...record });
//     queued.write();
// }

// export const PeekRecord = () => {
//     queued.read();
//     if (queued.data.Records.length > 0)
//         return queued.data.Records[0];
// };

// export const GetProcessed = () => {
//     processed.read();
//     return processed.data.Records;
// }

// export const UpdateAtHead = (body) => {
//     queued.read();

//     if (queued.data.Records.length > 0) {
//         if (body.Rate && isNaN(parseInt(body.Rate))) return 400;

//         const { Finalize, ...rest } = body;
//         queued.data.Records[0] = { ...queued.data.Records[0], ...rest };
//         queued.write();
//         return (Finalize && !PopRecord()) ? 204 : 200;
//     }
//     else
//         return 204;
// };

// export const GetQueued = () => {
//     queued.read();
//     return queued.data.Records;
// }

// export const GetParties = () => {
//     parties.read();
//     return parties.data.Records;
// }

// export const DeleteRecord = (id) => {
//     queued.read();
//     const remainingRecords = queued.data.Records.filter((record) => record.Id != id);
//     if (queued.data.Records.length === remainingRecords.length) return 404;
//     queued.data.Records = remainingRecords;
//     queued.write();
//     return 200;
// }

// export const ReQueue = (Id) => {
//     processed.read();
//     let recordToQueue;
//     let remainingRecords = [];

//     // Identifying the item to queue again and remaining items
//     for (const record of processed.data.Records)
//         if (record.Id == Id)
//             recordToQueue = record;
//         else
//             remainingRecords.push(record);

//     // Moving the identified item to queue in sequential order
//     if (recordToQueue) {
//         queued.read();
//         if (queued.data.Records.length > 0) {
//             for (let index = 0; index < queued.data.Records.length; index++) {
//                 if (Id < queued.data.Records[index].Id) {
//                     queued.data.Records.splice(index, 0, recordToQueue);
//                     break;
//                 }
//             }
//         }
//         else
//             queued.data.Records.push(recordToQueue);

//         // Committing the changes to DB
//         queued.write();
//         processed.data.Records = remainingRecords;
//         processed.write();
//         return 200;
//     }
//     else
//         return 404;
// }

// initializeDb();