/**
 * RAG Document Repository
 */
const {
  dbFindAll, dbFindById, dbFindWhere, dbInsert,
  dbUpdate, dbDelete, dbDeleteWhere
} = require('../database/init');

const D = 'rag_documentos';
const C = 'rag_contextos';

module.exports = {
  findAll:              ()       => (dbFindAll(D)||[]).filter(d => !d._deleted).sort((a,b) => new Date(b.created_at)-new Date(a.created_at)),
  findById:             (id)     => dbFindById(D, id),
  findByProf:           (pid)    => (dbFindAll(D)||[]).filter(d => d.professor_id === Number(pid) && !d._deleted),
  findByDisciplina:     (did)    => (dbFindAll(D)||[]).filter(d => d.disciplina_id === Number(did) && !d._deleted),
  create:               (data)   => dbInsert(D, { ...data, created_at: new Date().toISOString() }),
  update:               (id, f)  => dbUpdate(D, id, f),
  remove:               (id)     => dbDelete(D, id),

  // Contextos (chunks) — excluir marcados como deletados
  findContextosByDoc:   (docId)  => (dbFindAll(C)||[]).filter(c => c.doc_id === Number(docId) && !c._deleted),
  findContextosByDisc:  (discId) => (dbFindAll(C)||[]).filter(c => c.disciplina_id === Number(discId) && !c._deleted),
  createContexto:       (data)   => dbInsert(C, { ...data, created_at: new Date().toISOString() }),

  // Deletar chunks de um documento via dbDeleteWhere (mais eficiente que update loop)
  deleteContextosByDoc: (docId)  => dbDeleteWhere(C, c => c.doc_id === Number(docId)),
};
