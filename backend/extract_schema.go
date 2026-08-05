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
		if strings.HasPrefix(line, "CREATE TABLE `invoices`") ||
			strings.HasPrefix(line, "CREATE TABLE `invoice_items`") ||
			strings.HasPrefix(line, "CREATE TABLE `payments`") ||
			strings.HasPrefix(line, "CREATE TABLE `slip_records`") ||
			strings.HasPrefix(line, "CREATE TABLE `invoice_headers`") {
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
