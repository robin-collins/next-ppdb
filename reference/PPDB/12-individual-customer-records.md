# Individual Customer Records Documentation

## Page URL Pattern

`http://10.10.10.44/ppdb/show_customer.php?customerID=XXXX`

## Page Title Format

`[Customer Name]` (e.g., "James")
![[individual-customer-record.png]]

## Access Methods

- Click customer/owner name from search results
- Click customer name links from animal records
- Direct URL with customer ID

## Comprehensive Customer Management Interface

### Customer Information Section (Top)

#### Personal Details Form

- **First Name**: Editable text field (often empty in legacy records)
- **Surname**: Primary customer identifier (e.g., "James")
- **Address**: Multi-line text area for street address
- **Suburb**: City/suburb text field
- **Postcode**: Postal code field

#### Contact Information

- **Phone1**: Primary contact number (e.g., "0428111261")
- **Phone2**: Secondary phone number field
- **Phone3**: Tertiary phone number field
- **Email**: Email address field

#### Customer Management Actions

- **Update Record**: Save changes to customer information
- **DELETE CUSTOMER**: Remove customer from system (critical function)

### Associated Animals Management (Bottom)

#### Add New Animal

- **Add Animal**: Button to create new animal record for this customer
- **Direct Integration**: Links to add_animal.php with customer ID

#### Animal Listing Table

Displays all animals associated with this customer:

##### Table Columns

- **Show/Edit Animal Info**: Icon and name link to individual animal record
- **Breed**: Animal breed classification
- **Colour**: Physical description
- **Sex**: Male/Female designation
- **Delete**: Remove animal from customer record

##### Sample Animal Record

- **Animal**: "Cody" (clickable link to animal details)
- **Breed**: "Jack Russell Long Coat" (clickable link)
- **Colour**: "White and gold" (clickable link)
- **Sex**: "Male" (clickable link)
- **Action**: "Delete" button for removal

### Cross-Reference Integration

Every element in the animal table is clickable and leads to the detailed animal record, demonstrating tight integration between customer and animal management.

## Technical Features

### Form Functionality

- **Pre-populated Data**: Existing customer information automatically loaded
- **Multi-field Contact**: Support for multiple phone numbers
- **Address Management**: Comprehensive location information
- **Real-time Updates**: Changes saved via Update Record button

### Data Relationships

- **One-to-Many**: Single customer can have multiple animals
- **Bi-directional Links**: Navigation between customer and animal records
- **Referential Integrity**: Customer deletion would affect associated animals

### Business Logic

- **Customer-centric View**: All animals associated with customer visible
- **Service Integration**: Direct access to animal service records
- **Contact Management**: Complete customer communication information

## Business Operations Support

### Customer Service Applications

- **Contact Verification**: Complete customer contact information
- **Service History**: Access to all animals and their service records
- **Appointment Scheduling**: Customer and animal information for bookings
- **Billing Integration**: Customer details for invoicing

### Relationship Management

- **Multi-pet Households**: Single customer with multiple animals
- **Service Continuity**: Complete customer relationship overview
- **Communication History**: Contact information maintenance
- **Customer Lifecycle**: From initial contact to ongoing services

### Administrative Functions

- **Data Maintenance**: Customer information updates
- **Relationship Changes**: Adding/removing animals from customer
- **System Administration**: Customer deletion capabilities
- **Record Integration**: Links to all related animal records

## Data Quality Examples

### Legacy Data Characteristics

- **Minimal Personal Data**: Many fields empty (common in older systems)
- **Primary Identification**: Surname as main identifier
- **Phone-centric Contact**: Primary reliance on phone numbers
- **Service Focus**: Emphasis on animal records over customer profiles

### Integration Strengths

- **Complete Animal Access**: All customer's animals immediately visible
- **Seamless Navigation**: Easy movement between customer and animal records
- **Service Context**: Customer information available during animal service

## Screenshots

- Individual customer record: `screenshots/individual-customer-record.png`

## Mission Critical Assessment

This customer management interface is essential for:

- **Customer Service**: Complete customer information and contact details
- **Operational Efficiency**: Quick access to all customer's animals
- **Business Relationships**: Maintaining customer contact and service history
- **Data Integrity**: Central point for customer information management
- **Service Delivery**: Context for all animal services and appointments
