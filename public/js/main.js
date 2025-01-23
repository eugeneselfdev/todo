let db

const request = indexedDB.open('myDatabase', 1, function(upgradeDb) {
  db = upgradeDb
  db.createObjectStore('store')
})

request.onsuccess = function() {
  db = request.result
}

request.onerror = function() {
  console.log('Error')
}



