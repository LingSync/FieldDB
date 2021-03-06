function(doc) {
  var convertDatumIntoSimpleObject = function(datum) {
    var obj = {},
      fieldKeyName = "label";

    for (var i = 0; i < datum.datumFields.length; i++) {
      if (datum.datumFields[i].id && datum.datumFields[i].id.length > 0) {
        fieldKeyName = "id"; /* update to version 2.35+ */
      } else {
        fieldKeyName = "label";
      }
      if (datum.datumFields[i].mask) {
        obj[datum.datumFields[i][fieldKeyName]] = datum.datumFields[i].mask;
      }
    }
    if (datum.session.sessionFields) {
      for (var j = 0; j < datum.session.sessionFields.length; j++) {
        if (datum.session.sessionFields[j].id && datum.session.sessionFields[j].id.length > 0) {
          fieldKeyName = "id"; /* update to version 2.35+ */
        } else {
          fieldKeyName = "label";
        }
        if (datum.session.sessionFields[j].mask) {
          obj[datum.session.sessionFields[j][fieldKeyName]] = datum.session.sessionFields[j].mask;
        }
      }
    }
    return obj;
  };
  try {
    /* if this document has been deleted, the ignore it and return immediately */
    if (doc.trashed && doc.trashed.indexOf("deleted") > -1) {
      return;
    }
    // If the document is a Datum
    if (doc.audioVideo) {
      var datum = convertDatumIntoSimpleObject(doc);
      if (datum.judgement && datum.judgement.indexOf("*") >= 0) {
        return;
      }
      if (datum.utterance && datum.utterance.indexOf("*") >= 0) {
        return;
      }

      // Tokenize the utterance
      var words = datum.utterance.toLowerCase().split(/[#?!.,\/ -]+/);
      // For each token
      for (var word in words) {
        // If the token it not null or the empty string
        if (words[word]) {
          // Replace (*_) with "
          var feederWord = words[word].replace(/\(\*[^)]*\)/g, "");
          // Replace *(_) with _
          feederWord = feederWord.replace(/\*\(([^)]*)\)/, "$1");
          // Remove all parentheses and *
          var fullWord = feederWord.replace(/[(*)]/g, "");
          // Remove parentheses and all characters between the
          // parentheses
          var option1 = feederWord.replace(/\([^)]*\)/g, "");
          // If those two removals ended up with difference
          // strings
          if (fullWord !== option1) {
            // Emit the version without the characters between
            // the parentheses
            emit([option1.split("").reverse().join(""), option1], 1);
          }
          // Emit the version without parentheses
          emit([fullWord.split("").reverse().join(""), fullWord], 1);
        }
      }
    }
  } catch (e) {
    //emit(e, 1);
  }
}
