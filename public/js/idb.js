let db;

const request =indexedDB.open('budget_track', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createobjectStore('new_transaction', {autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.online) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetobjectStore = transaction.objectStore('new_transaction');
    budgetobjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetobjectStore = transaction.objectStore('new_transaction');
    const getTrans = budgetobjectStore.getTrans();

    getTrans.onsuccess = function () {
        if (getTrans.result.length > 0) {
            fetch('api/transaction', {
                method: 'POST',
                body: JSON.stringify(getTrans.result),
                headers: {
                    Accept: 'application/json, tet/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const budgetobjectStore = transaction.objectStore('new_transaction');
                budgetobjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}