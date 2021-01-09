import db from '../../../db/initializing'

const documentStatusRepository = {
  selectDocumentNotDone: async (userId) => {
    const result = await db
      .select('document_id', 'name', 'version', 'status_process_document')
      .from('document')
      .where('rec_create_by', userId)
    return result
  },
  selectDocumentById: async (documentId, userId) => {
    const result = await db
      .select('document_id', 'name', 'version', 'status_process_document', 'path_image')
      .from('document')
      .where('document_id', documentId)
      .andWhere('rec_create_by', userId)
    return result
  },
  selectPageInDocumentWithId: async (documentId, pageId) => (
    db.select().from('page_in_document').where('index_document_id', documentId).andWhere('page_index', pageId)
  ),
  selectPageInDocument: async (documentId) => db.select()
    .from('page_in_document')
    .where('index_document_id', documentId),
  selectPretermInPage: async (pageId) => db.select()
    .from('pre_term_in_page')
    .where('index_page_in_document_id', pageId),
  insertPreterm: async (newPreterm, pageId) => {
    const row = await db
      .insert({ pre_term: newPreterm, index_page_in_document_id: pageId })
      .from('pre_term_in_page')
    const id = row[0]
    const result = await db
      .select('pre_term_in_page_id', 'pre_term')
      .from('pre_term_in_page')
      .where('pre_term_in_page_id', id)
    return result
  },
  editPreterm: async (newPreterm, preTermId) => {
    await db('pre_term_in_page')
      .update('pre_term', newPreterm)
      .where('pre_term_in_page_id', preTermId)
    const result = await db
      .select('pre_term_in_page_id', 'pre_term')
      .from('pre_term_in_page')
      .where('pre_term_in_page_id', preTermId)
    return result
  },
  deletePreterm: async (preTermId) => {
    const result = await db('pre_term_in_page')
      .where('pre_term_in_page_id', preTermId)
      .del()
    return result
  },
  updatePageStatus: async (pageId, status) => {
    const result = await db('page_in_document')
      .update('rec_status_confirm', status)
      .where('page_in_document_id', pageId)
    return result
  },
  clearPertermInPage: async (pageId) => db('pre_term_in_page')
    .where('index_page_in_document_id', pageId)
    .del(),
  overidePertermInPage: async (bodys) => db('pre_term_in_page')
    .insert(bodys),
  addNewPage: async (pageIndex, name, documentId) => db('page_in_document')
    .insert({
      page_index: pageIndex,
      name,
      rec_status_confirm: 0,
      index_document_id: documentId,
    }),
  checkIndexInPage: async (documentId, indexPage) => {
    const result = await db.select()
      .from('page_in_document')
      .where('index_document_id', documentId)
      .andWhere('page_index', indexPage)
    if (result.length === 0) return false
    return true
  },
}

export default documentStatusRepository
