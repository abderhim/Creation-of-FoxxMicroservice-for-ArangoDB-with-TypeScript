'use strict';
const db = require('@arangodb').db;
const collectionName = 'myFoxxCollectiontssize';
const collectionNa = 'typescriptts';
const edgecollectionName = 'myFoxxCollectionedgests';


if (!db._collection(collectionName)) {
    
    db._createDocumentCollection(collectionName);
    
}


 
  