const PDFDocument = require('pdfkit');
const Nota = require('../modules/academico/models/Nota');

exports.gerarBoletim = async (req, res) => {

    try {

        const alunoId = req.session.user.id;
        const nomeAluno = req.session.user.nome;

        const dados = await Nota.boletimAluno(alunoId);

        if (!dados || dados.length === 0) {
            return res.send("Nenhuma disciplina encontrada.");
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=boletim.pdf');

        doc.pipe(res);

        /* ==========================
           CABEÇALHO
        ========================== */
        doc.fontSize(18).text('BOLETIM ESCOLAR', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Aluno: ${nomeAluno}`);
        doc.text(`Data de emissão: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        /* ==========================
           ORGANIZAR DISCIPLINAS
        ========================== */

        let disciplinas = {};

        dados.forEach(item => {

            if (!disciplinas[item.disciplina]) {
                disciplinas[item.disciplina] = [];
            }

            disciplinas[item.disciplina].push(item);
        });

        /* ==========================
           CONTEÚDO
        ========================== */

        Object.keys(disciplinas).forEach(nomeDisciplina => {

            doc.moveDown();
            doc.fontSize(14).text(`Disciplina: ${nomeDisciplina}`, { underline: true });
            doc.moveDown(0.5);

            let soma = 0;
            let pesoTotal = 0;

            disciplinas[nomeDisciplina].forEach(av => {

                const nota = av.nota !== null ? av.nota : '-';

                doc.fontSize(12).text(
                    `${av.titulo}  |  Nota: ${nota}`
                );

                if (av.nota !== null) {
                    soma += parseFloat(av.nota) * parseFloat(av.peso);
                    pesoTotal += parseFloat(av.peso);
                }
            });

            const media = pesoTotal > 0
                ? (soma / pesoTotal).toFixed(2)
                : '-';

            doc.moveDown(0.5);
            doc.fontSize(12).text(`Média Final: ${media}`);
            doc.moveDown();
        });

        doc.end();

    } catch (error) {
        console.error("Erro ao gerar boletim:", error);
        res.status(500).send("Erro ao gerar boletim.");
    }
};