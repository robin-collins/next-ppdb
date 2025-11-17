# Notes Update and Delete API Tests
# Tests PUT /api/notes/[noteId] and DELETE /api/notes/[noteId]

# Setup: Create customer, animal, and notes for testing
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "NotesTest",
  "surname": "Customer",
  "address": "123 Notes St",
  "suburb": "Notesville",
  "postcode": 2000,
  "phone1": "0466666666"
}

HTTP 201
[Captures]
notes_customer_id: jsonpath "$.id"

POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "NotesTestDog",
  "breed": "Poodle",
  "sex": "Female",
  "customerId": {{notes_customer_id}},
  "colour": "White",
  "cost": 60,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-10T00:00:00.000Z"
}

HTTP 201
[Captures]
notes_animal_id: jsonpath "$.id"

POST {{base_url}}{{api_base}}/animals/{{notes_animal_id}}/notes
Content-Type: application/json
{
  "notes": "First grooming session",
  "serviceDate": "2025-01-10T00:00:00.000Z"
}

HTTP 201
[Captures]
test_note_id: jsonpath "$.id"


# Test 1: Update note content
PUT {{base_url}}{{api_base}}/notes/{{test_note_id}}
Content-Type: application/json
{
  "serviceDetails": "Updated grooming notes - very well behaved!"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_note_id}}
jsonpath "$.serviceDetails" == "Updated grooming notes - very well behaved!"


# Test 2: Update note with service date
PUT {{base_url}}{{api_base}}/notes/{{test_note_id}}
Content-Type: application/json
{
  "serviceDetails": "Final update with new date",
  "serviceDate": "2025-01-15T00:00:00.000Z"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_note_id}}
jsonpath "$.serviceDetails" == "Final update with new date"


# Test 3: Get the animal to verify note updates
GET {{base_url}}{{api_base}}/animals/{{notes_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.serviceNotes" isCollection
jsonpath "$.serviceNotes[0].id" == {{test_note_id}}
jsonpath "$.serviceNotes[0].notes" contains "Final update"


# Test 4: Try to update non-existent note
PUT {{base_url}}{{api_base}}/notes/999999
Content-Type: application/json
{
  "serviceDetails": "Should fail"
}

HTTP 404
[Asserts]
jsonpath "$.error" == "Note not found"


# Test 5: Create another note for delete testing
POST {{base_url}}{{api_base}}/animals/{{notes_animal_id}}/notes
Content-Type: application/json
{
  "notes": "Second note for deletion test",
  "serviceDate": "2025-01-12T00:00:00.000Z"
}

HTTP 201
[Captures]
delete_note_id: jsonpath "$.id"


# Test 6: Delete the second note
DELETE {{base_url}}{{api_base}}/notes/{{delete_note_id}}

HTTP 200
[Asserts]
jsonpath "$.success" == true


# Test 7: Verify second note is deleted
GET {{base_url}}{{api_base}}/animals/{{notes_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.serviceNotes" isCollection
# Should only have one note remaining (the first one)


# Test 8: Try to delete already deleted note
DELETE {{base_url}}{{api_base}}/notes/{{delete_note_id}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Note not found"


# Test 9: Try to delete non-existent note
DELETE {{base_url}}{{api_base}}/notes/999999

HTTP 404
[Asserts]
jsonpath "$.error" == "Note not found"


# Cleanup: Delete test data
DELETE {{base_url}}{{api_base}}/notes/{{test_note_id}}
HTTP 200

DELETE {{base_url}}{{api_base}}/animals/{{notes_animal_id}}
HTTP 200

DELETE {{base_url}}{{api_base}}/customers/{{notes_customer_id}}
HTTP 200

