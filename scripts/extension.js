export const PDFExtractExtension = {
  name: 'PDFExtract',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_pdfExtract',
  render: ({ trace, element }) => {
    const pdfExtractContainer = document.createElement('div')
    pdfExtractContainer.innerHTML = `
      <style>
        .vfrc-message--extension-PDFExtract {
          background-color: transparent !important;
          background: none !important;
        }
        .pdf-extract-container {
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fff;
        }
        .pdf-input {
          display: none;
        }
        .pdf-select-button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #000 !important;
          background-color: #fff !important;
          border: 1px solid #000 !important;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .pdf-select-button:hover {
          background-color: #000 !important;
          color: #fff !important;
        }
        .pdf-status {
          margin-top: 10px;
          font-size: 14px;
        }
      </style>
      <div class="pdf-extract-container">
        <input type="file" class="pdf-input" accept=".pdf">
        <button class="pdf-select-button">Select PDF</button>
        <div class="pdf-status"></div>
      </div>
    `

    const pdfInput = pdfExtractContainer.querySelector('.pdf-input')
    const selectButton = pdfExtractContainer.querySelector('.pdf-select-button')
    const statusDiv = pdfExtractContainer.querySelector('.pdf-status')

    selectButton.addEventListener('click', () => pdfInput.click())

    pdfInput.addEventListener('change', async (event) => {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        statusDiv.textContent = 'Extracting text from PDF...'
        try {
          const text = await extractTextFromPDF(file)
          statusDiv.textContent = 'Text extracted successfully!'
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: { pdfText: text },
          })
        } catch (error) {
          console.error('Error extracting text from PDF:', error)
          statusDiv.textContent = 'Error extracting text from PDF.'
          window.voiceflow.chat.interact({
            type: 'error',
            payload: { error: 'Failed to extract text from PDF' },
          })
        }
      } else {
        statusDiv.textContent = 'Please select a valid PDF file.'
      }
    })

    async function extractTextFromPDF(file) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => item.str).join(' ') + '\n'
      }
      return text.trim()
    }

    element.appendChild(pdfExtractContainer)
  },
}
