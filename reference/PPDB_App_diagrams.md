# PPDB App diagrams

## 🗺️ **1. Site Map / Navigation Flow Diagram**

**Best for**: Showing the frameset structure and page relationships

```mermaid
flowchart TD
    A[Main Frameset /ppdb/] --> B[Top Frame: search.php]
    A --> C[Bottom Frame: home.php]
    B --> D[Add Customer]
    B --> E[Add Breed]
    B --> F[Daily Totals]
    B --> G[Old Customers]
    B --> H[Search Controls]
    D --> I[add_customer.php]
    E --> J[edit_breed.php - New Tab]
    H --> K[show_search.php]
    K --> L[show_animal.php]
    K --> M[show_customer.php]
    L --> N[show-all-notes.php]
    M --> O[add_animal.php]
```

## 🗄️ **2. Entity Relationship Diagram (ERD)**

**Best for**: Database structure and relationships

```mermaid
erDiagram
    CUSTOMERS ||--o{ ANIMALS : owns
    ANIMALS ||--o{ SERVICE_NOTES : has
    ANIMALS }o--|| BREEDS : classified_as

    CUSTOMERS {
        int customerID PK
        string firstname
        string surname
        string address
        string suburb
        string postcode
        string phone1
        string phone2
        string phone3
        string email
    }

    ANIMALS {
        int animalID PK
        int customerID FK
        string animal_name
        string breed
        string sex
        string colour
        decimal cost
        date lastvisit
        date thisvisit
        text comments
    }

    SERVICE_NOTES {
        int noteID PK
        int animalID FK
        date service_date
        text service_details
        decimal cost
        string technician_code
    }

    BREEDS {
        int breedID PK
        string breed_name
        time avg_time
        decimal avg_cost
    }
```

## 🔄 **3. User Journey / Workflow Diagrams**

**Best for**: Business processes and user interactions

```mermaid
flowchart TD
    A[Staff opens PPDB] --> B{Customer known?}
    B -->|Yes| C[Search by name/animal/email/phone]
    B -->|No| D[Add new customer]
    C --> L[Select customer record]
    L --> G
    C --> E[Select animal record]
    D --> F[Add animal to customer]
    E --> G[Review service history]
    F --> G
    G --> H[Update visit dates]
    H --> I[Add service notes]
    I --> J[Update record]
    J --> K[Print/reference for service]
```

## 🏗️ **4. System Architecture Diagram**

**Best for**: Technical components and technology stack

```mermaid
flowchart TB
    subgraph "Browser Client"
        A[Frameset HTML]
        B[Top Frame: Navigation]
        C[Bottom Frame: Content]
    end

    subgraph "Web Server"
        D[Apache/PHP Server]
        E[search.php]
        F[show_animal.php]
        G[add_customer.php]
        H[edit_breed.php]
        I[backup-data.php]
    end

    subgraph "Database Layer"
        J[MySQL Database]
        K[Customers Table]
        L[Animals Table]
        M[Service Notes Table]
        N[Breeds Table]
    end

    subgraph "File System"
        O[Backup Archives]
        P[TAR.GZ Files]
    end

    A --> D
    B --> E
    C --> F
    D --> J
    I --> O
    J --> K
    J --> L
    J --> M
    J --> N
```

## 📊 **5. Feature Hierarchy Mind Map**

**Best for**: Organizing and understanding feature scope

```mermaid
mindmap
  root((PPDB Features))
    Customer Management
      Add Customer
      Edit Customer
      Delete Customer
      Customer Search
    Animal Management
      Add Animal
      Edit Animal
      Service History
      Individual Records
    Breed Management
      200+ Breeds
      Pricing Database
      Time Estimates
      CRUD Operations
    Search System
      Multi-field Search
      Pagination (3953 records)
      Real-time Results
    Business Intelligence
      Daily Totals
      Historical Reports
      Service Analytics
    Data Management
      Automated Backup
      TAR.GZ Archives
      Data Export
```

## ⏱️ **6. Service History Timeline**

**Best for**: Showing chronological service records

```mermaid
timeline
    title Service History: Cody (Jack Russell)

    2015 : 14-11-2015
         : full clip 7 short ears and face cc

    2016 : 08-03-2016
         : full clip 7 short ears and face cc
         : 13-10-2016
         : full clip 7 short ears and face th

    2017 : 11-05-2017
         : full clip 5 short ears and face cc $50
         : 18-12-2017
         : full clip 7 short ears and face cc

    2019 : 08-11-2019
         : full clip 5 short ears and face bb $55

    2020 : 10-03-2020
         : full clip 3 short ears and face hm
         : 27-08-2020
         : full clip 3 short ears and face CC
         : 08-12-2020
         : full clip 5 short ears and face BB

    2021 : 25-05-2021
         : full clip 3 short ears and face bb
         : 10-09-2021
         : Full clip 3 legs 7 short ears & face leave top knot CC $60
```

## 🔄 **7. State Diagram**

**Best for**: Application states and transitions

```mermaid
stateDiagram-v2
    [*] --> MainFrame
    MainFrame --> SearchView : search query
    MainFrame --> AddCustomer : add customer
    MainFrame --> DailyTotals : daily totals
    MainFrame --> OldCustomers : old customers

    SearchView --> AnimalRecord : select animal
    SearchView --> CustomerRecord : select customer
    SearchView --> MainFrame : clear/new search

    AnimalRecord --> EditAnimal : edit mode
    AnimalRecord --> ServiceHistory : view history
    AnimalRecord --> MainFrame : back

    CustomerRecord --> AddAnimal : add animal
    CustomerRecord --> EditCustomer : edit mode
    CustomerRecord --> AnimalRecord : select animal

    AddCustomer --> MainFrame : save/cancel
    AddAnimal --> AnimalRecord : save
    EditAnimal --> AnimalRecord : save/cancel
```

## 📈 **8. Data Flow Diagram**

**Best for**: How data moves through the system

```mermaid
flowchart LR
    A[User Input] --> B[Search Form]
    B --> C[PHP Processing]
    C --> D[Database Query]
    D --> E[MySQL Database]
    E --> F[Result Set]
    F --> G[PHP Formatting]
    G --> H[HTML Generation]
    H --> I[Frame Display]

    J[Form Submission] --> K[Validation]
    K --> L[Database Insert/Update]
    L --> E

    M[Backup Request] --> N[Data Export]
    N --> E
    E --> O[TAR.GZ Creation]
    O --> P[File Download]
```

## 🎯 **9. Use Case Diagram**

**Best for**: Different user scenarios and system interactions

```mermaid
flowchart TD
    subgraph "Grooming Staff User"
        A[Check in Customer]
        B[Search Animal Records]
        C[Add Service Notes]
        D[Update Animal Info]
        E[Print Service History]
    end

    subgraph "Manager User"
        F[Add New Customers]
        G[Manage Breed Database]
        H[View Daily Totals]
        I[Generate Backups]
        J[Analyze Historical Data]
    end

    subgraph "System Functions"
        K[Customer Database]
        L[Animal Records]
        M[Service History]
        N[Breed Management]
        O[Backup System]
    end

    A --> K
    B --> L
    C --> M
    D --> L
    E --> M
    F --> K
    G --> N
    H --> M
    I --> O
    J --> M
```

## 🏆 **Most Valuable Diagrams for This Legacy System:**

### **Essential (Must-Have):**

1. **Site Map** - Critical for understanding frameset navigation
2. **ERD** - Essential for database structure comprehension
3. **User Journey** - Key for operational workflow understanding

### **Highly Valuable:**

4. **System Architecture** - Important for technical understanding
5. **Feature Mind Map** - Excellent overview of system capabilities
6. **Service Timeline** - Shows real business data patterns

### **Specialized Use:**

7. **State Diagram** - Useful for developers/modernization
8. **Data Flow** - Technical documentation
9. **Use Case** - Business process documentation

These diagrams would be particularly effective because they can show the **complexity hidden behind the simple interface**, demonstrate the **sophisticated business logic**, and illustrate the **mature data relationships** that make this legacy system so valuable to the business.
