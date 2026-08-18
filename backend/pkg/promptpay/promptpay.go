package promptpay

import (
	"fmt"
	"strings"

	"github.com/skip2/go-qrcode"
)

// crc16 calculates CRC-16 CCITT (False)
func crc16(data string) string {
	crc := 0xFFFF
	for i := 0; i < len(data); i++ {
		crc ^= int(data[i]) << 8
		for j := 0; j < 8; j++ {
			if (crc & 0x8000) > 0 {
				crc = (crc << 1) ^ 0x1021
			} else {
				crc = crc << 1
			}
		}
	}
	return fmt.Sprintf("%04X", crc&0xFFFF)
}

func formatAmount(amount float64) string {
	amountStr := fmt.Sprintf("%.2f", amount)
	return fmt.Sprintf("54%02d%s", len(amountStr), amountStr)
}

func formatPromptPayID(id string) string {
	id = strings.ReplaceAll(id, "-", "")
	id = strings.ReplaceAll(id, " ", "")

	var formattedID string
	if len(id) == 10 { // Mobile number
		formattedID = "0066" + id[1:]
	} else { // National ID
		formattedID = id
	}
	
	// Tag 01 length depends on formattedID length (usually 13)
	merchantInfo := fmt.Sprintf("0016A00000067701011101%02d%s", len(formattedID), formattedID)
	return fmt.Sprintf("29%02d%s", len(merchantInfo), merchantInfo)
}

// GeneratePayload generates EMVCo standard string for Thai PromptPay
func GeneratePayload(promptpayID string, amount float64) string {
	payload := "000201" // Payload Format Indicator
	if amount > 0 {
		payload += "010212" // Point of Initiation Method (12 = Dynamic)
	} else {
		payload += "010211" // Point of Initiation Method (11 = Static)
	}
	
	payload += formatPromptPayID(promptpayID)
	payload += "5802TH" // Country Code
	payload += "5303764" // Currency Code (THB)

	if amount > 0 {
		payload += formatAmount(amount)
	}

	payload += "6304" // CRC Tag
	crc := crc16(payload)
	payload += crc

	return payload
}

// GenerateQRImage generates the PNG bytes for the QR Code
func GenerateQRImage(promptpayID string, amount float64, size int) ([]byte, error) {
	payload := GeneratePayload(promptpayID, amount)
	return qrcode.Encode(payload, qrcode.Medium, size)
}
