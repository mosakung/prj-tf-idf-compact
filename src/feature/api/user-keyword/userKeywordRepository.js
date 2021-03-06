import db from '../../../db/initializing'

const userKeywordRepository = {
  viewUserKeywordRepository: async (id) => db.select('DC_keyword_id', 'DC_keyword').from('dc_keyword').where('index_document_id', id),

  alreadyKeyword: async (keyword, docId) => db
    .select()
    .from('dc_keyword')
    .where('DC_keyword', keyword)
    .andWhere('index_document_id', docId),

  getKeyword: async (id) => db
    .select('DC_keyword')
    .from('dc_keyword')
    .where('DC_keyword_id', id),

  deleteKeyword: async (id) => db('dc_keyword').where('DC_keyword_id', id).del(),
  insertUserKeywordRepository: async (insertBody) => db.insert(insertBody).into('dc_keyword'),
  convertIdToUserKeyword: async (id) => db.select('DC_keyword').from('dc_keyword').where('DC_keyword_id', id),
  alreadyTerm: async (keyword) => db.select('term_word_id').from('term_word').where('term', keyword),

  alreadyScore: async (idTerm, idDocument) => db
    .select('score_id', 'score_tf')
    .from('score')
    .where('index_term_word_id', idTerm)
    .andWhere('index_document_id', idDocument),

  insertTerm: async (rawTerm) => db.from('term_word').insert({ term: rawTerm, frequency: 1 }),
  increaseTerm: async (id) => db.from('term_word').increment('frequency', 1).where('term_word_id', id),

  decreaseTerm: async (id) => {
    const result = await db.from('term_word').decrement('frequency', 1).where('term_word_id', id)
    const termRow = await db.select('frequency').from('term_word').where('term_word_id', id)
    if (termRow[0].frequency === 0) {
      await db('term_word').where('term_word_id', id).del()
    }
    return result
  },

  insertScore: async (termId, documentId) => db.insert({
    score_tf: 0,
    index_term_word_id: termId,
    index_document_id: documentId,
    generate_by: 'init-user',
  }).from('score'),

  deleteScore: async (scoreId) => db('score').where('score_id', scoreId).del(),
  scoreMarkTagUser: async (id) => db('score').update('generate_by', 'init-user').where('score_id', id),
  scoreMarkTagSystem: async (id) => db('score').update('generate_by', 'init-system').where('score_id', id),

  updateIdfTerm: async (termId) => {
    const timestamp = db.fn.now()
    const row = await db('document').count('document_id as value').where('rec_status', 1).andWhereBetween('status_process_document', [5, 6])
    const N = row[0].value
    return db('term_word').update({ score_idf: db.raw(`?? / ${N}`, ['frequency']), rec_modified_at: timestamp }).where('term_word_id', termId)
  },

  updateTfdfDocument: async (documentId) => {
    const row = await db('score').max('score_tf_idf as max')
    const maxScore = row[0].max
    return db('score').update({ score_tf_idf: maxScore }).where('index_document_id', documentId)
  },

  selectTopNTag: async (pk, limit) => {
    const rowScores = await db
      .select('index_term_word_id', 'score_tf_idf', 'score_id')
      .from('score')
      .where('index_document_id', pk)
      .andWhere('generate_by', 'init-system')
      .andWhere('rec_status', 1)
      .orderBy('score_tf_idf', 'desc')
      .limit(limit)
    const result = await Promise.all(rowScores.map(async (element) => {
      const rowTerm = await db.select('term').from('term_word').where('term_word_id', element.index_term_word_id)
      return rowTerm[0].term
    }))
    return result
  },

  getKeywordByString: async (keyword, documentId) => db
    .select('DC_keyword_id', 'DC_keyword')
    .from('dc_keyword')
    .where('DC_keyword', keyword)
    .andWhere('index_document_id', documentId),

  alreadyStatus5Document: async (documentId) => {
    const row = await db
      .select('status_process_document')
      .from('document')
      .where('document_id', documentId)
      .andWhere('rec_status', 1)
      .andWhere('status_process_document', 5)
    if (row.length === 0) return false
    return true
  },

  updateDocmentDone: async (documentId) => db('document')
    .where('document_id', documentId)
    .andWhere('rec_status', 1)
    .update('status_process_document', 6),
}

export default userKeywordRepository
