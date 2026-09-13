---
chapter: 62
title: "Entity relationship modelling"
section: 11
section_title: "Databases and software development"
spec_area: "4.10"
spec_area_title: "Fundamentals of databases"
level: "A Level (Year 13)"
pdf_pages: "328-332"
figures: 6
source: "AQA AS and A Level Computer Science (P.M. & R.S.U. Heathcote), PG Online, ISBN 978-1-910523-07-0"
---

# Chapter 62 — Entity relationship modelling
## Objectives

- Produce a data model from given data requirements for a simple scenario involving multiple entities
- Produce entity descriptions representing a data model in the form Entity1 (Attribute1, Attribute2...)
- Produce entity relationship diagrams representing a data model
© Be able to define the terms attribute, primary key, composite primary key, foreign key

## Modelling data requirements

When a systems designer begins work on a new proposed computer system, one of the first things they need to do is to examine the data that needs to be input, processed and stored and determine what the data entities are. Definition: An entity is a category of object, person, event or thing of interest to an organisation about which data is to be recorded. Examples of entities are: Employee, Film, Actor, Product, Recipe, Ingredient. Each entity in a database system has attributes. Example 1: A dentist's surgery employs several dentists, and an appointments system is required to allow patients to make appointments with a particular dentist. Entities in this system include Dentist, Patient and Appointment. The attributes of Dentist may include Title, Firstname, Surname, Qualification. Attributes of Patient may include Title, Firstname, Surname, Address, Telephone.

## Entity descriptions

![Figure from page 328](figures/ch62-p328-01.png)

## Entity identifier and primary key

Each entity needs to have an entity identifier which uniquely identifies the entity. In a relational database, the entity identifier is known as the primary key and it will be referred to as such in this section. Clearly none of the attributes so far identified for Dentist and Patient is suitable as a primary key. A numeric or string ID such as D13649 could be used. In the entity description, the primary key is underlined. Dentist (DentistID, Title, Firstname, Surname, Qualification)

## Relationships between entities

The different entities in a system may be linked in some way, and the two entities are said to be related. There are only three different 'degrees' of relationship between two entities. A relationship may be

- • One-to-one Examples of such a relationship include the relationship between Husband and Wife, Country and Prime Minister.
- One-to-many Examples include the relationship between Mother and Child, Customer and Order, Borrower and Library Book.
- • Many-to-many Examples include the relationship between Student and Course, Stock Item and Supplier, Film and Actor.

## Entity relationship diagrams

An entity relationship diagram is a diagrammatic way of representing the relationships between the entities in a database. To show the relationship between two entities, both the degree and the name of the relationship need to be specified. E.g. In the first relationship shown below, the degree is one-to-one,

![Figure from page 329](figures/ch62-p329-02.png)

## The concept of a relational database

In a relational database, a separate table is created for each entity identified in the system. Where a relationship exists between entities, an extra field called a foreign key links the two tables.

## Foreign key

A foreign key is an attribute that creates a join between two tables. It is the attribute that is common to both tables, and the primary key in one table is the foreign key in the table to which it is linked.

## Example 1

In the one-to-many relationship between Dentist and Patient, the entity on the 'many' side of the relationship will have DentistID as an extra attribute. This is the foreign key.

![Figure from page 329](figures/ch62-p329-03.png)

Note that the primary key is indicated by an asterisk, and the foreign key is shown in italics.

## Linking tables in a many-to-many relationship

When there is a many-to-many relationship between two entities, tables cannot be directly linked in this way. For example, consider the relationship between Student and Course. A student takes many courses, and the same course is taken by many students. Student > takes q Course Many-to-many In this case, an extra table is needed to link the Student and Course tables. We could call this StudentCourse, or Enrolment, for example. Product ~ ProductComp & Component The three tables will now have attributes something like those shown below:

![Figure from page 330](figures/ch62-p330-04.png)

In this data model, the table linking Student and Course has two foreign keys, each linking to one of the two main tables. The two foreign keys also act as the primary key of this table. A primary key which consists of more than one attribute is called a composite primary key.

## Drawing an entity relationship diagram

A database system will frequently involve many different entities linked to each other, and an entity relationship diagram can be drawn to show all the relationships.

## Example 2

A hospital inpatient system may involve entities Ward, Nurse, Patient and Consultant. A ward is staffed by many nurses, but each nurse works on only one ward. A patient is in a ward and has many nurses looking after them, as well as a consultant, who sees many patients on different wards. staffed by Consultant


---

## Exercises

1. An estate agent keeps a database of all the properties it has for sale, the owners of the properties, and all the prospective buyers. Details about the properties for sale include address, number of bedrooms, type of property, asking price. Data on prospective buyers include name, telephone, address, type of property required, lower and

![Figure from page 331](figures/ch62x-p331-01.png)

(a) Suggest three attributes for the entity Viewing. [3] (b) Write entity descriptions for each of the entities Property, Vendor, Buyer and Viewing. In each case, identify any primary and foreign keys. [8] (c) Draw an entity relationship diagram showing relationships between these four entities. [4] 2. A library plans to set up a database to keep track of its members, books and loans. Entities are

![Figure from page 331](figures/ch62x-p331-02.png)

(a) Draw an entity relationship diagram showing the relationships between the entities. [3] (b) A relational database is created with tables for each of these entities. The key in the Loan table is made up of two fields. What is the name given to a key that is made up of multiple attributes? (1) (c) What is meant by a foreign key? Identify a foreign key in one of the tables. [3] 3. An exam board wants to set up a database to hold data about its courses, exam papers, exam entries, candidates and results. For the purpose of this exercise, assume that each candidate can sit each exam once only. A course may have several exam papers (Comp 1, Comp 2, etc.). You may assume that a candidate enrolled for a course will sit every exam paper associated with that course. The data to be stored for the candidate are CandidateNumber, FirstName, Surname, DateOfBirth. The data to be stored for the course are CourselD, Subject, Level The data held for each individual exam paper includes CourselD, ExamPaperID, DateOfExam, Title, TotalMarks, ExamPaperWeighting. (a) State an identifier for the entity ExamPaper. (1) (b) Write an entity description for another entity which will be required to show which courses each student is taking. [3] (c) Draw an entity relationship diagram showing the relationships between the entities. [5] (d) Write an entity description for a Results entity which will store the exam mark that candidates receive for each exam paper. [2]
