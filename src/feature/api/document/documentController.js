import { parserDocument } from './parserDocument'
import { getDocumentService, getDocumentsService, insertDocumentService } from './documentService'

export const getDocumentController = async (pk) => {
  const respones = await getDocumentService(pk)

  if (!respones) {
    return { statusQuery: false }
  }

  return { statusQuery: true, ...respones }
}

export const getDocumentsController = async () => {
  const respones = await getDocumentsService()

  if (!respones) {
    return { statusQuery: false, documents: [] }
  }

  return { statusQuery: true, documents: respones }
}

export const insertDocumentController = async (req, context) => {
  const body = { ...req }
  const document = parserDocument(body, context)

  if (!document) {
    return { status: false, message: 'paserDocument is false', prevBody: {} }
  }

  const respones = await insertDocumentService(document, context)

  if (!respones) {
    return { status: false, message: 'respones is false', prevBody: {} }
  }

  return respones
}

export default {}
