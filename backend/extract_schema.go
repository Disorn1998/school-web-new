package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	file, err := os.Open(`C:\Users\msi\Downloads\new.portal.stmarks.ac.th\new.portal.stmarks.ac.th\public_html\school-system\db\school_system.sql`)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	printLines := 0

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "CREATE TABLE `homework`") ||
			strings.HasPrefix(line, "CREATE TABLE `homework_files`") ||
			strings.HasPrefix(line, "CREATE TABLE `homework_submissions`") ||
			strings.HasPrefix(line, "CREATE TABLE `scores`") ||
			strings.HasPrefix(line, "CREATE TABLE `student_scores`") ||
			strings.HasPrefix(line, "CREATE TABLE `lesson_plans`") ||
			strings.HasPrefix(line, "CREATE TABLE `reports`") {
			printLines = 25
		}

		if printLines > 0 {
			fmt.Println(line)
			printLines--
			if printLines == 0 {
				fmt.Println("--------------------------------")
			}
		}
	}
}
