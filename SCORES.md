# Search Relevance Scoring Documentation

## Table of Contents
1. [Overview](#overview)
2. [Scoring Methodology](#scoring-methodology)
3. [Single-Word Query Scoring](#single-word-query-scoring)
4. [Multi-Word Query Scoring](#multi-word-query-scoring)
5. [Score Ranges](#score-ranges)
6. [Examples with Detailed Breakdowns](#examples-with-detailed-breakdowns)

---

## Overview

The search relevance scoring system determines how well a database record matches a user's search query. The algorithm assigns numerical scores to each result, with higher scores indicating better matches. Results are then sorted by score (descending) to show the most relevant matches first.

### Key Principles

1. **Term-based scoring**: Each word in the query is scored independently
2. **Field-type awareness**: Matches across different field categories (customer name, animal name, breed) receive bonuses
3. **Match quality levels**: Exact matches score higher than partial matches
4. **Additive scoring**: For multi-word queries, scores accumulate across terms

---

## Scoring Methodology

### Match Quality Levels

The algorithm recognizes four levels of match quality:

```mermaid
graph TD
    A[Match Quality Hierarchy] --> B[Level 1: EXACT MATCH<br/>100 pts]
    A --> C[Level 2: STARTS WITH<br/>80 pts]
    A --> D[Level 3: CONTAINS<br/>50 pts]
    A --> E[Level 4: FUZZY MATCH<br/>30 pts]
    
    B --> B1["Field = search term<br/>Example: 'magic' matches 'Magic'"]
    C --> C1["Field starts with term<br/>Example: 'col' matches 'Collins'"]
    D --> D1["Term found anywhere<br/>Example: 'son' matches 'Johnson'"]
    E --> E1["70%+ character overlap<br/>Example: 'magic' ≈ 'magician'"]
    
    style B fill:#90EE90
    style C fill:#87CEEB
    style D fill:#FFD700
    style E fill:#FFA500
```

### Searchable Fields

The system searches across **8 fields** organized into **4 categories**:

```mermaid
mindmap
  root((Searchable<br/>Fields))
    Customer Name
      customer.firstname
      customer.surname
    Customer Contact
      customer.email
      customer.phone1
      customer.phone2
      customer.phone3
    Animal Name
      animal.animalname
    Breed Name
      breed.breedname
```

---

## Single-Word Query Scoring

For single-word queries, the algorithm checks the search term against **all 8 fields** and returns the **highest score** found.

### Algorithm Flow

```mermaid
flowchart TD
    A[Start: Single-word query 'magic'] --> B[Check all 8 fields]
    
    B --> C1[customer.firstname: 'John'<br/>Score: 0]
    B --> C2[customer.surname: 'Collins'<br/>Score: 0]
    B --> C3[customer.email: 'jc@email.com'<br/>Score: 0]
    B --> C4[customer.phone1: '0412345678'<br/>Score: 0]
    B --> C5[customer.phone2: null<br/>Score: 0]
    B --> C6[customer.phone3: null<br/>Score: 0]
    B --> C7[animal.animalname: 'Magic'<br/>Score: 100 ✓]
    B --> C8[breed.breedname: 'Maltese'<br/>Score: 0]
    
    C1 --> D[Return maximum score]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    C6 --> D
    C7 --> D
    C8 --> D
    
    D --> E[Final Score: 100]
    
    style C7 fill:#90EE90
    style E fill:#FFD700
```

### Example: "col"

```mermaid
flowchart LR
    A[Query: 'col'] --> B{Check Fields}
    B --> C1[customer.firstname: 'Smith'<br/>0 pts]
    B --> C2[customer.surname: 'Smith'<br/>0 pts]
    B --> C3[animal.animalname: 'Cody'<br/>0 pts]
    B --> C4[breed.breedname: 'Collie'<br/>80 pts ✓ Starts with]
    
    C1 --> D[Max Score: 80]
    C2 --> D
    C3 --> D
    C4 --> D
    
    style C4 fill:#87CEEB
    style D fill:#FFD700
```

---

## Multi-Word Query Scoring

For multi-word queries, the algorithm uses a **term-by-term additive scoring** approach with a **diversity bonus**.

### Algorithm Flow

```mermaid
flowchart TD
    A["Query: 'magic collins'"] --> B[Split into terms]
    B --> C["Terms: ['magic', 'collins']"]
    
    C --> D1[Process Term 1: 'magic']
    D1 --> E1{Check all field categories}
    E1 -->|Customer Name| F1["firstname: 0<br/>surname: 0<br/>Best: 0"]
    E1 -->|Customer Contact| F2["email: 0<br/>phones: 0<br/>Best: 0"]
    E1 -->|Animal Name| F3["animalname: 100 ✓<br/>Best: 100"]
    E1 -->|Breed| F4["breedname: 0<br/>Best: 0"]
    
    F1 & F2 & F3 & F4 --> G1["Term 1 Score: 100<br/>Category: Animal"]
    
    C --> D2[Process Term 2: 'collins']
    D2 --> E2{Check all field categories}
    E2 -->|Customer Name| H1["firstname: 0<br/>surname: 100 ✓<br/>Best: 100"]
    E2 -->|Customer Contact| H2["email: 0<br/>phones: 0<br/>Best: 0"]
    E2 -->|Animal Name| H3["animalname: 0<br/>Best: 0"]
    E2 -->|Breed| H4["breedname: 0<br/>Best: 0"]
    
    H1 & H2 & H3 & H4 --> G2["Term 2 Score: 100<br/>Category: Customer"]
    
    G1 & G2 --> I[Sum term scores: 200]
    
    I --> J{Check diversity}
    J -->|2 categories matched| K[Diversity bonus: +25]
    J -->|1 category matched| L[No bonus]
    
    K --> M[Final Score: 225]
    L --> N[Final Score = Sum]
    
    style F3 fill:#90EE90
    style H1 fill:#90EE90
    style M fill:#FFD700
```

### Why Diversity Bonus?

The diversity bonus rewards queries where terms match **different types** of information:

```mermaid
graph TD
    A[Diversity Bonus Logic] --> B{How many<br/>unique categories<br/>matched?}
    
    B -->|1 category| C[No Bonus<br/>Example: 'john smith'<br/>Both are Customer Name]
    B -->|2 categories| D[+25 pts Bonus<br/>Example: 'magic collins'<br/>Animal + Customer]
    B -->|3 categories| E[+50 pts Bonus<br/>Example: 'magic maltese collins'<br/>Animal + Breed + Customer]
    B -->|4 categories| F[+75 pts Bonus<br/>All field types matched]
    
    style C fill:#FFB6C1
    style D fill:#90EE90
    style E fill:#87CEEB
    style F fill:#FFD700
```

**Example Scenarios:**

```mermaid
flowchart LR
    A1["Query: 'magic collins'"] --> B1["'magic' → Animal Name<br/>'collins' → Customer Name"]
    B1 --> C1["2 categories<br/>Bonus: +25 pts"]
    
    A2["Query: 'john smith'"] --> B2["'john' → Customer First<br/>'smith' → Customer Surname"]
    B2 --> C2["1 category<br/>Bonus: 0 pts"]
    
    A3["Query: 'magic maltese collins'"] --> B3["'magic' → Animal<br/>'maltese' → Breed<br/>'collins' → Customer"]
    B3 --> C3["3 categories<br/>Bonus: +50 pts"]
    
    style C1 fill:#90EE90
    style C2 fill:#FFB6C1
    style C3 fill:#87CEEB
```

---

## Score Ranges

### Single-Word Queries

| Score Range | Match Type | Description |
|-------------|------------|-------------|
| 100 | Exact | Field exactly equals search term |
| 80 | Starts With | Field begins with search term |
| 50 | Contains | Search term found anywhere in field |
| 30 | Fuzzy | 70%+ character overlap |
| 0 | No Match | No match found in any field |

### Multi-Word Queries

| Score Range | Likely Scenario |
|-------------|-----------------|
| 200+ | Both terms exact/starts-with matches + bonus |
| 150-199 | Both terms matched well, one or both with lower quality |
| 100-149 | One strong match, one weak/no match |
| 60-99 | Both terms weak matches or one term matched only |
| 30-59 | Single weak match |
| 0 | No matches found |

---

## Examples with Detailed Breakdowns

### Example 1: "magic collins" (Correct Record)

**Record:** Animal="Magic", Customer Surname="Collins", Breed="Maltese"

```mermaid
flowchart TD
    A[Query: 'magic collins'] --> B[Term 1: 'magic']
    A --> C[Term 2: 'collins']
    
    B --> D1["Customer Name: 0"]
    B --> D2["Customer Contact: 0"]
    B --> D3["Animal Name: 100 ✓"]
    B --> D4["Breed: 0"]
    D1 & D2 & D3 & D4 --> E1["Term 1: 100 pts<br/>Matched: Animal"]
    
    C --> F1["Customer Name: 100 ✓"]
    C --> F2["Customer Contact: 0"]
    C --> F3["Animal Name: 0"]
    C --> F4["Breed: 0"]
    F1 & F2 & F3 & F4 --> E2["Term 2: 100 pts<br/>Matched: Customer"]
    
    E1 & E2 --> G[Subtotal: 200 pts]
    
    G --> H["Categories: {Animal, Customer}<br/>Count: 2"]
    H --> I[Diversity Bonus: +25 pts]
    
    I --> J[FINAL SCORE: 225 pts]
    
    style D3 fill:#90EE90
    style F1 fill:#90EE90
    style J fill:#FFD700
```

**Scoring Summary:**
- Term 1 "magic": 100 pts (Animal Name - exact match)
- Term 2 "collins": 100 pts (Customer Name - exact match)
- Subtotal: 200 pts
- Diversity bonus: 25 pts (2 categories)
- **FINAL SCORE: 225 pts**

### Example 2: "magic collins" (Wrong Record)

**Record:** Animal="Magic", Customer Surname="Young", Breed="Poodle"

```mermaid
flowchart TD
    A[Query: 'magic collins'] --> B[Term 1: 'magic']
    A --> C[Term 2: 'collins']
    
    B --> D1["Customer Name: 0"]
    B --> D2["Customer Contact: 0"]
    B --> D3["Animal Name: 100 ✓"]
    B --> D4["Breed: 0"]
    D1 & D2 & D3 & D4 --> E1["Term 1: 100 pts<br/>Matched: Animal"]
    
    C --> F1["Customer Name: 0<br/>Young ≠ collins"]
    C --> F2["Customer Contact: 0"]
    C --> F3["Animal Name: 0"]
    C --> F4["Breed: 0"]
    F1 & F2 & F3 & F4 --> E2["Term 2: 0 pts<br/>No match!"]
    
    E1 & E2 --> G[Subtotal: 100 pts]
    
    G --> H["Categories: {Animal}<br/>Count: 1"]
    H --> I[No Diversity Bonus]
    
    I --> J[FINAL SCORE: 100 pts]
    
    style D3 fill:#90EE90
    style F1 fill:#FFB6C1
    style J fill:#FFA500
```

**Scoring Summary:**
- Term 1 "magic": 100 pts (Animal Name - exact match)
- Term 2 "collins": 0 pts (no match)
- Subtotal: 100 pts
- Diversity bonus: 0 pts (only 1 category)
- **FINAL SCORE: 100 pts**

**Result Comparison:**

```mermaid
graph LR
    A[Search: 'magic collins'] --> B[Correct Record<br/>Magic + Collins]
    A --> C[Wrong Record<br/>Magic + Young]
    
    B --> D[225 pts ✓]
    C --> E[100 pts]
    
    D --> F[Difference: 125 pts<br/>Clear distinction!]
    E --> F
    
    style D fill:#90EE90
    style E fill:#FFB6C1
    style F fill:#FFD700
```

### Example 3: "bobby maltese"

**Comparison of Two Records:**

```mermaid
flowchart TD
    A[Query: 'bobby maltese'] --> B[Record 1:<br/>Bobby, Maltese, Smith]
    A --> C[Record 2:<br/>Bobby, Poodle, Smith]
    
    B --> D1["bobby: 100 Animal<br/>maltese: 100 Breed"]
    D1 --> E1[Subtotal: 200<br/>Categories: 2<br/>Bonus: +25]
    E1 --> F1[Score: 225]
    
    C --> D2["bobby: 100 Animal<br/>maltese: 0 No match"]
    D2 --> E2[Subtotal: 100<br/>Categories: 1<br/>Bonus: 0]
    E2 --> F2[Score: 100]
    
    F1 & F2 --> G[Record 1 wins by 125 pts]
    
    style F1 fill:#90EE90
    style F2 fill:#FFB6C1
```

### Example 4: Partial Matches "col"

```mermaid
flowchart LR
    A[Query: 'col'] --> B[Record 1:<br/>Collins, Max, Collie]
    A --> C[Record 2:<br/>Coleman, Cody, Poodle]
    
    B --> D["surname 'Collins': 80<br/>breed 'Collie': 80<br/>Max: 80"]
    C --> E["surname 'Coleman': 80<br/>Max: 80"]
    
    D --> F[Both score 80 pts]
    E --> F
    
    F --> G[Sorted alphabetically:<br/>Coleman, then Collins]
    
    style F fill:#87CEEB
```

### Example 5: Email Search "joh@gm"

```mermaid
flowchart TD
    A[Query: 'joh@gm'] --> B{Check all fields}
    
    B --> C1[Customer Name: 0]
    B --> C2["Email: 'john@gmail.com'<br/>Contains 'joh@gm': 50 pts ✓"]
    B --> C3[Phone fields: 0]
    B --> C4[Animal Name: 0]
    B --> C5[Breed: 0]
    
    C1 & C2 & C3 & C4 & C5 --> D[Max Score: 50 pts]
    
    style C2 fill:#FFD700
    style D fill:#FFA500
```

---

## Summary

### Key Takeaways

```mermaid
mindmap
  root((Scoring<br/>System))
    Single-Word
      Max score across 8 fields
      Range: 0-100 pts
    Multi-Word
      Sum of term scores
      Diversity bonus
      Range: 0-325+ pts
    Match Quality
      Exact: 100
      Starts: 80
      Contains: 50
      Fuzzy: 30
    Benefits
      Precise scoring
      Intuitive ranking
      Field aware
      Transparent
```

### Algorithm Advantages

✓ **Precise scoring**: Multi-word queries correctly distinguish between partial and complete matches  
✓ **Intuitive ranking**: Better matches always score higher  
✓ **Field awareness**: Recognizes different types of information  
✓ **Scalable**: Performance remains consistent with additional search terms  
✓ **Transparent**: Scores displayed to users for debugging and confidence  

### Score Progression Examples

```mermaid
graph LR
    A[Single fuzzy: 30] --> B[Single contains: 50]
    B --> C[Single starts: 80]
    C --> D[Single exact: 100]
    D --> E[Two exact: 200]
    E --> F[Two exact + bonus: 225]
    F --> G[Three exact + bonus: 325]
    
    style A fill:#FFA500
    style B fill:#FFD700
    style C fill:#87CEEB
    style D fill:#90EE90
    style E fill:#90EE90
    style F fill:#87CEEB
    style G fill:#FFD700
```

---

*Document Version: 2.0*  
*Last Updated: 2025-10-04*  
*Algorithm Location: `src/app/api/animals/route.ts`*
