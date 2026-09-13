---
chapter: 20
title: "Role of an operating system"
section: 4
section_title: "Hardware and software"
spec_area: "4.6"
spec_area_title: "Fundamentals of computer systems"
level: "AS / A Level (Year 12)"
pdf_pages: "112-115"
figures: 0
source: "AQA AS and A Level Computer Science (P.M. & R.S.U. Heathcote), PG Online, ISBN 978-1-910523-07-0"
---

# Chapter 20 — Role of an operating system
## Objectives

Understand that the role of the operating system is to hide the complexities of the hardware from the user

- Know that the OS handles resource management, managing hardware to allocate processors, memories and I/O devices among competing processes

## What is an operating system?

An operating system is a program or set of programs that manages the operations of the computer for the user. It acts as a bridge between the user and the computer's hardware, since a user cannot communicate with hardware directly. The operating system is held in permanent storage, for example on a hard disk. A small program called the loader is held in ROM. When a computer is switched on, the loader in ROM sends instructions to load the operating system by copying it from storage into RAM. Hardware

## Functions of an operating system

Regardless of whether the operating system is embedded within an mp3 player or is the latest version of Windows installed on a desktop computer, all operating systems share the same basic functions. An operating system disguises the complexities of managing and communicating with its hardware from the user via an Application Programming Interface (API). Through this interface, a user can naively tap away to complete their tasks, (loading, saving or printing for example), oblivious to the actual operations taking place behind the scenes to support their actions. Apart from providing a user interface, the operating system has to perform the following functions:

- memory management
- processor scheduling
- backing store management
- management of all input and output
We will look at what each of these functions involve.

## Memory management

APC allows a user to be working on several tasks at the same time. You may be listening to music via a streaming site such as Spotify, entering a Python program, checking your emails every so often and running Word so that you can document your program design. Meanwhile, a virus checker may be running in the background. Each program, open file or copied clipboard item, for example, must be allocated a specific area of memory whilst the computer is running. Should a user wish to switch from one application to another in a separate window, each application must be stored in memory simultaneously. The allocation and management of space is controlled by the operating system. In some cases, the computer's RAM may not be not large enough to store all these programs simultaneously, so the hard disk is used as an extension of memory - called virtual memory. MS Word may be open on your desktop but if you are not actually using it at a particular time, the operating system may copy the Word software and data to hard disk to free up RAM for the browser software, the Pascal compiler or whatever you as the user have requested. When you switch back to Word, the operating system will reload it into memory.

## Processor scheduling

With computers able to run multiple applications simultaneously, the operating system is responsible for allocating processor time to each one as they compete for the CPU. While one application is busy using the CPU for processing, the OS can queue up the next process required by another application to make the most efficient use of the processor. A computer with a single-core processor can only process one instruction at a time, but by carrying out small parts of multiple larger tasks in turn, the processor can give the appearance of carrying out several tasks simultaneously. This is what is meant by multi-tasking. The scheduler is the operating system module responsible for making sure that processor time is used as efficiently as possible. Of course, this is a much more complex task on a large multi-user system where many users may, for example, be accessing the same database or running different applications on an application server. The objectives of the scheduler are to:

- maximise throughput
- be fair to all users on a multi-user system
- provide acceptable response time to all users
- ensure hardware resources are kept as busy as possible

## Backing store management

When files and applications are loaded, they are transferred from backing storage into memory. The operating system is required to keep a directory of where files are stored so that they can be quickly accessed. Similarly, it needs to know which areas of storage are free so that new files or applications can be saved. The file management system that comes with your desktop operating system enables a user to move files and folders, delete files and protect others from unauthorised access.

## Peripheral management

Different applications will require different input or output devices throughout their operation. If you send a file to print, the operating system will need to communicate with the printer to check that it is switched on and online, check that it is a printer and not, say, the keyboard and begin communication to send it the correct data to print. The operating system also ensures that peripherals are allocated to processes without causing conflicts.

## Interrupt handling

An interrupt is a signal from a peripheral or software program that causes the operating system to stop processing its current list of instructions and think what to do next. Should an error occur such as a software crash or 'out of paper' message from a printer, the OS is responsible for detecting the interrupt signal and displaying an appropriate error message for the user if appropriate. It is because a processor can be interrupted that multi-tasking can take place.


---

## Exercises

1. Explain the purpose of the operating system. [2] 2. An operating system is designed to hide the complexities of the hardware from the user and to manage the hardware and other resources. Give three different types of management of either hardware or other resources that are performed by an operating system. [3] AQA Comp 3 Qu 1 June 2013
