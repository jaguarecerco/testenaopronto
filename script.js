const { jsPDF } = window.jspdf;


const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let isDrawing = false;


canvas.addEventListener("mousedown", () => {
    isDrawing = true;
    ctx.beginPath();
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.closePath();
});

document.getElementById("clearSignature").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});


function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Gera o PDF
function generatePDF(event) {
    event.preventDefault();

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 80;


    doc.addImage(imageBase64, 'PNG', 19, 15, 170, 45);


    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("INQUÉRITO POLICIAL", 105, 70, null, null, "center");

    doc.setFontSize(12);

 
    const autoridadePolicial = document.getElementById('autoridadePolicial').value || 'Não informado';
    const unidade = document.getElementById('unidade').value || 'Não informado';
    const endereco = document.getElementById('endereco').value || 'Não informado';
    const cidade = document.getElementById('cidade').value || 'Não informado';
    const data = document.getElementById('data').value || 'Não informado';
    const formattedData = formatDate(data); 
    const assunto = document.getElementById('assunto').value || 'Não informado';
    const descricao = document.getElementById('descricao').value || 'Não informado';
    const solicitacaoMedidas = document.getElementById('solicitacaoMedidas').value || 'Não informado';
    const tipificacao = document.getElementById('tipificacao').value || 'Não informado';
    const instanciaTipificacao = document.getElementById('instanciaTipificacao').value || 'Não informado';

    const content = [
        ['Autoridade Policial:', autoridadePolicial],
        ['Unidade:', unidade],
        ['Endereço:', endereco],
        ['Cidade:', cidade],
        ['Data:', formattedData],
    ];

    const questionSpacing = 6.5;

    content.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 20, yPosition);
        const labelWidth = doc.getTextWidth(label);
        const answerX = 20 + labelWidth + 2;
        doc.setFont("helvetica", "normal");
        doc.text(value, answerX, yPosition);
        yPosition += questionSpacing;


        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20; 
        }
    });

    yPosition += 2;
    doc.setLineWidth(6);
    doc.line(20, yPosition, 190, yPosition);

    const sections = [
        ['Assunto:', assunto],
        ['Descrição das Acusações:', descricao],
        ['Solicitação de Medidas:', solicitacaoMedidas],
        ['Processo de instância penal - Tipificação:', tipificacao],
        ['Processo de Instância Interna - Tipificação:', instanciaTipificacao],
    ];

    sections.forEach(([sectionTitle, sectionContent], index) => {
        yPosition += 10;
        doc.setFont("helvetica", "bold");
        doc.text(sectionTitle, 20, yPosition);

        yPosition += 7;
        doc.setFont("helvetica", "normal");
        const splitContent = doc.splitTextToSize(sectionContent, 170); 
        splitContent.forEach(line => {

            if (yPosition + 7 > pageHeight - 30) {
                doc.addPage();
                yPosition = 20; 
            }
            doc.text(line, 20, yPosition);
            yPosition += 7;
        });

        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20; 
        }

        if (index < sections.length - 1) {
            yPosition += 5;
            doc.setLineWidth(6);
            doc.line(20, yPosition, 190, yPosition);
        }
    });

    const signatureDataURL = canvas.toDataURL("image/png");
    yPosition += 15; 
    doc.text("Assinatura:", 20, yPosition); 
    yPosition += -4; 


    doc.addImage(signatureDataURL, 'PNG', 41, yPosition, 50, 10); 


    doc.save('inquerito_policial.pdf');
}

document.getElementById("generatePdfBtn").addEventListener("click", generatePDF);
