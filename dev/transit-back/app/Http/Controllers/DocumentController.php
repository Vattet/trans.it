<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\DocumentHelper;
use App\Models\Document;
use OpenApi\Attributes as OA;

class DocumentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/documents",
     *     summary="Récupérer tous les documents",
     *     tags={"Documents"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Liste de tous les documents"
     *     )
     * )
     */
    public function getAll()
    {
        $documents = DocumentHelper::GetAllDocument();
        return response()->json($documents);
    }
    /**
     * @OA\Get(
     *     path="/api/users/{id}/documents",
     *     summary="Récupérer tous les documents appartenant à un utilisateur",
     *     tags={"Documents"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Liste des documents appartenant à l'utilisateur"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Aucun document trouvé pour cet utilisateur"
     *     )
     * )
     */
    public function getAllByUser($id)
    {
        $documents = DocumentHelper::GetAllDocumentByUserId($id);

        if (!$documents || count($documents) === 0) {
            return response()->json(['message' => 'No documents found for this user'], 404);
        }

        return response()->json($documents);
    }
    /**
     * @OA\Get(
     *     path="/api/documents/{id}",
     *     summary="Récupère un document via son ID",
     *     tags={"Documents"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du document",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Document trouvé"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Document non trouvé"
     *     )
     * )
     */
    public function show($id)
    {
        $document = DocumentHelper::GetDocumentById($id);

        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        return response()->json($document);
    }

    /**
     * @OA\Post(
     *     path="/api/documents",
     *     summary="Créer un nouveau document",
     *     tags={"Documents"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"Id_User", "Nom_document", "Chemin_stockage", "Tailles_MB"},
     *             @OA\Property(property="Id_User", type="integer", example=1),
     *             @OA\Property(property="Nom_document", type="string", example="monfichier.pdf"),
     *             @OA\Property(property="Chemin_stockage", type="string", example="/uploads/documents/abc.pdf"),
     *             @OA\Property(property="Tailles_MB", type="number", format="float", example=3.25),
     *             @OA\Property(property="IsActive", type="boolean", example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Document créé avec succès"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la création"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'Id_User' => 'required|integer',
            'Nom_document' => 'required|string|max:255',
            'Chemin_stockage' => 'required|string|max:500',
            'Tailles_MB' => 'required|numeric',
            'IsActive' => 'boolean',
        ]);

        $validated['Date_Creation'] = now();
        $validated['Date_Update'] = now();

        $status = DocumentHelper::InsertDoc($validated);

        return response()->json(['status' => $status], $status === 'success' ? 201 : 400);
    }

    /**
     * @OA\Put(
     *     path="/api/documents/{id}",
     *     summary="Mettre à jour un document",
     *     tags={"Documents"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du document à mettre à jour",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="Nom_document", type="string", example="nouveau_nom.pdf"),
     *             @OA\Property(property="Chemin_stockage", type="string", example="/uploads/documents/new.pdf"),
     *             @OA\Property(property="Tailles_MB", type="number", example=5.75),
     *             @OA\Property(property="IsActive", type="boolean", example=true)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Document mis à jour"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la mise à jour"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'Nom_document' => 'sometimes|string|max:255',
            'Chemin_stockage' => 'sometimes|string|max:500',
            'Tailles_MB' => 'sometimes|numeric',
            'IsActive' => 'sometimes|boolean',
        ]);

        $validated['Date_Update'] = now();

        $status = DocumentHelper::UpdateDocumentById($id, $validated);

        if ($status === "error") {
            return response()->json(['message' => 'Update failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * @OA\Delete(
     *     path="/api/documents/{id}",
     *     summary="Supprimer un document",
     *     tags={"Documents"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du document",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Document supprimé"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la suppression"
     *     )
     * )
     */
    public function destroy($id)
    {
        $status = DocumentHelper::DeleteDocumentById($id);

        if ($status === "error") {
            return response()->json(['message' => 'Delete failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }
}
