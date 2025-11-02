# Add Breed / Breed Management Documentation

## Page URL

`http://10.10.10.44/ppdb/edit_breed.php`

## Page Title

"Untitled Document"
![[add-breed-management.png]]

## Access Method

Accessed by clicking the "Add Breed" button from the main search interface (opens in new tab).

## Functionality Overview

This page serves dual purposes: adding new breeds and managing existing breed data. It is clearly a mission-critical component for the grooming business operations.

## Add New Breed Section (Top of Page)

### Form Fields

- **Breed**: Text input for breed name
- **Avg. Time**: Text input for average grooming time (format: HH:MM:SS)
- **Avg. Cost**: Text input for average cost (numeric, appears to be in local currency)
- **Insert Record**: Button to add the new breed to the database

## Existing Breeds Management Section

### Table Structure

Comprehensive table displaying all breeds in the system with columns:

- **BREED**: Editable text field showing breed name
- **TIME**: Editable time field (HH:MM:SS format)
- **COST**: Editable numeric field for pricing
- **Update**: Button to save changes to individual breed
- **Delete**: Button to remove breed from system

### Breed Categories Observed

The system includes diverse animal types:

#### Dogs

Extensive list including:

- **Working Dogs**: German Shepherd (01:00:00, $85), Rottweiler (01:00:00, $80)
- **Toy Breeds**: Chihuahua varieties, Pomeranian (01:00:00, $65)
- **Terriers**: Jack Russell varieties, Bull Terrier, Fox Terrier
- **Sporting Dogs**: Golden Retriever (01:00:00, $85), Labrador (01:00:00, $75)
- **Herding Dogs**: Border Collie (01:00:00, $85), Australian Shepherd
- **Designer Breeds**: Labradoodle ($115), Groodle, Cavoodle ($70)

#### Other Animals

- **Cats**: Listed at (01:00:00, $115)
- **Small Animals**: Guinea Pig ($70), Rabbit (00:00:01, $95)

### Time and Cost Patterns

#### Time Estimates

- **Quick Services**: Some breeds show 00:00:00 (likely bath-only services)
- **Standard Grooming**: Most breeds 01:00:00 (1 hour)
- **Complex Grooming**: Old English Sheepdog (02:00:00), Cocker Spaniel (02:00:00)
- **Specialty Cases**: Some show seconds only (00:00:01, 00:00:30, 00:00:45)

#### Cost Range

- **Budget Services**: $45-50 (simple breeds like Chihuahua Smooth Coat, Pug)
- **Standard Services**: $60-85 (most common breeds)
- **Premium Services**: $115-135 (complex coats like Afghan Hound, St Bernard, New Foundland $120)

## Business Intelligence

This system reveals:

- **Service Diversity**: Accommodates wide range of animals beyond just dogs
- **Pricing Strategy**: Time-based pricing with breed-specific considerations
- **Operational Planning**: Precise time estimates enable appointment scheduling
- **Cost Management**: Standardized pricing per breed type

## Technical Features

- **Real-time Editing**: Each breed row is independently editable
- **Batch Operations**: Individual Update/Delete buttons for each entry
- **Data Validation**: Time format appears standardized to HH:MM:SS
- **Comprehensive Coverage**: Over 200+ breed entries visible

## Operational Usage

Staff would use this to:

1. **Quote Services**: Look up standard time/cost for customer's breed
2. **Schedule Appointments**: Allocate appropriate time slots
3. **Add New Breeds**: When encountering new/rare breeds
4. **Update Pricing**: Modify costs based on market conditions
5. **Manage Services**: Remove discontinued breed categories

## Screenshots

- Full breed management system: `screenshots/add-breed-management.png`

## Business Critical Nature

This appears to be the core pricing and scheduling reference for the entire grooming operation, containing years of accumulated breed-specific knowledge and pricing data.
