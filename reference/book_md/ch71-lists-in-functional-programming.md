---
chapter: 71
title: "Lists in functional programming"
section: 12
section_title: "OOP and functional programming"
spec_area: "4.12"
spec_area_title: "Fundamentals of functional programming"
level: "A Level (Year 13)"
pdf_pages: "380-383"
figures: 2
source: "AQA AS and A Level Computer Science (P.M. & R.S.U. Heathcote), PG Online, ISBN 978-1-910523-07-0"
---

# Chapter 71 — Lists in functional programming
## Objectives

- Understand that a list is a concatenation of a head and a tail, where the head is an element of a list and the tail is a list
- Define an empty list
![Figure from page 380](figures/ch71-p380-01.png)

## Head and tail of a list

A list is a collection of elements of a similar type, such as integers, characters or strings, enclosed in square brackets. For example, in Haskell a list may be created using the keyword let: let names = ["Anna", "Bob", "Jo", "Keira", "Tom", "George"] let numbers = [3, 7, 14, 83, 2, 77] (Alternatively, you can create the list in Notepad, save and load the file.

![Figure from page 380](figures/ch71-p380-02.png)

A list is composed of a head and a tail. The head is the first element of the list, and the tail is the remainder of the list. In Haskell: Prelude>:load "lists.hs" [1 of 1] Compiling Main ( lists.hs, interpreted ) Ok, modules loaded: Main.

- Main> names ["Anna", "Bob", "Jo", "Keira","Tom", "George"]
- Main> numbers (3,7,14,83,2,77]
- Main> head names "Anna"
- Main> tail names ["Bob", "Jo", "Keira", "Tom", "George"]
We can apply the list argument repeatedly to the function tail. For example:

- Main> tail (tail (tail numbers) ) [83,2,77]
Working from the right, the tail of the list [3, 7, 14, 83, 2, 77] is [7,14,83,2,77] The tail of this list is [14, 83, 2, 77] Finally the tail of this list is [83, 2, 77] Note that applying a function such as head or tail does not change the original list. Lists are immutable, which means that they can never be changed.

## Defining an empty list

An empty list has no elements and is written []. You can create an empty list directly in Haskell: let newlist = [] The function null tests for an empty list.

- Main> null numbers False
- Main> null newlist True
- Main>

## Prepending and appending to a list

Prepending means adding an element to the front of a list, and appending means adding an element to the end of a list. To add an element to the front of the list, you can either add an element using the: (colon) operator, or add a list using the ++ operator.

- Main> 5:numbers (5, 3, 7, 14, 83, 2, 77]
- Main> [6, 10] ++ numbers [6, 10, 3, 7, 14, 83, 2, 77]
- Main> 8 : 9 : 10 : numbers (8, 9, 10, 3, 7, 14, 83, 2, 77]
To append an element to the end of a list, one method in Haskell to use the ++ operator and append a list made from the element to be appended.

- Main> numbers ++ [100] (3, 7, 14, 83, 2, 77, 100]
Remember this does not alter the original list. We can find the length of numbers using the length function.

- Main> length numbers


---

## Exercises

1. The list animals contains the following items: ["otter", "fox", "deer", "badger", "seal", "dolphin"] What result is returned by each of the following function calls? (a) _ tail animals (1) (b) head (tail (tail animals)) (2) (c) null (tail (tail (tail (tail (tail (tail animals)))))) (2) 2. The list results contains the following items: (56, 78, 45, 62, 68] What result is returned by applying each of the following functions? (a) map (*2) results (1) () _ filter (>50) results 1] 12-71 (c) map (*2) (filter (>60) results) [2] 3. Write code to (a) add the numbers 2, 6, 8 to the start of a list xs [7,2,4,10] (1) (b) add the numbers 12,13,14 to the end of xs. (1) (c) remove the first number from xs (1) (d) replace the first two numbers from the list xs with 12, 13 {3]
