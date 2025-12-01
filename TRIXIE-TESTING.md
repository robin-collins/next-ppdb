SIDEBAR
❓what is the delete icon and cross icon for?
❌ Dashboard - what should this do - returns to main page?
❌ Search Results - what should this do - returns to main page?
✔️ Add Customer
✔️ Manage Breeds
❌ Daily Analytics http://10.10.10.10:3000/analytics >> error: 404 This page could not be found.
✔️ Customer History
✔️ Database Backup (note sidebar icon doesn't work from this page but header does)

HEADER SEARCH BAR
❌ displayed as "list" needs headings and doesn't include same info as displayed as "cards"
missing fields: customer first name, address, phone 2, phone 3, colour
additional field: cost
❌ issue if spaces in front of mobile number (message "No animals found matching " 0475911560". Try a different search term.")
❌ 20 results limit? search for "german shepherd" or "collins" only returns 20 records

CONTENTS

Add New Breed via Manage Breeds http://10.10.10.10:3000/breeds
❌ no field for column CATEGORY
❌ added duplicate breeds e.g. Breed Name "ATest" now has mulitple different records (old app error "Duplicate entry 'Atest' for key 3")
❓ average cost must be in multiples of $5?
✔️cannot add breed with $1 average cost (message: "please select a valid value, the nearest two valid values are 0 and 5")
✔️cannot add breed with $72 average cost (message: "please select a valid value, the nearest two valid values are 70 and 75")
Existing Breeds Database
❌ cannot update existing breed e.g. Cattle Dog should be DOGS not CATS
❌ difficult to update Average Time due to display format: 1970-01-01T01:00:00.000Z

Add Customer

- only mandatory field is surname?

Update Customer http://10.10.10.10:3000/customer/7815
❌ cannot delete customer email >> error: Invalid request data
✔️ can update customer first name, last name, address, suburb, postcode, email, phone 1, comments
✔️ can delete customer first name, address, suburb, postcode, phone 1, comments
✔️ cannot delete mandatory field customer last name

Add Animal
❓Cost must be between $1 and $999? http://10.10.10.10:3000/customer/7742/newAnimal
❌ cannot add new animal with $0 cost >> error: Invalid request data
✔️ cannot add new animal with $1000 cost (message: "please select a value that is no more than 999"

Update Animal
❌ cannot update any field (name, breed, sex, colour, cost, comments) and click update record http://10.10.10.10:3000/animals/10761 >> error: Invalid request data
❌ cannot click change dates then click update record http://10.10.10.10:3000/animals/10763 >> error: Invalid request data
