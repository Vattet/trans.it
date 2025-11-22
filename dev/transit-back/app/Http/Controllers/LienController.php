<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\LienHelper;

class LienController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/documents/{id}/link",
     *     summary="Récupérer le lien associé à un document",
     *     tags={"Liens"},
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
     *         description="Lien trouvé"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Aucun lien trouvé pour ce document"
     *     )
     * )
     */
    public function getByDocument($idDocument)
    {
        $link = LienHelper::GetLinkByIdDoc($idDocument);

        if (!$link) {
            return response()->json(['message' => 'Link not found'], 404);
        }

        return response()->json($link);
    }

    /**
     * @OA\Post(
     *     path="/api/links",
     *     summary="Créer un lien de partage",
     *     tags={"Liens"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"Id_Document", "Code_unique", "URL"},
     *             @OA\Property(property="Id_Document", type="integer", example=12),
     *             @OA\Property(property="Code_unique", type="string", example="ABC123XYZ"),
     *             @OA\Property(property="URL", type="string", example="https://trans.it/download/ABC123XYZ"),
     *             @OA\Property(property="Nb_Acces", type="integer", example=0),
     *             @OA\Property(property="IsActive", type="boolean", example=true),
     *             @OA\Property(property="Date_Expiration", type="string", format="date-time", example="2025-12-31 23:59:59")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Lien créé avec succès"
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
            'Id_Document' => 'required|integer',
            'Code_unique' => 'required|string|max:255',
            'URL' => 'required|string|max:500',
            'Nb_Acces' => 'integer',
            'IsActive' => 'boolean',
            'Date_Expiration' => 'nullable|date',
        ]);

        $validated['Date_Creation'] = now();

        $status = LienHelper::InsertLink($validated);

        return response()->json(['status' => $status], $status === 'success' ? 201 : 400);
    }

    /**
     * @OA\Put(
     *     path="/api/links/{id}",
     *     summary="Mettre à jour un lien de partage",
     *     tags={"Liens"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID du lien à mettre à jour",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="Code_unique", type="string", example="NEWCODE999"),
     *             @OA\Property(property="URL", type="string", example="https://trans.it/download/NEWCODE999"),
     *             @OA\Property(property="Nb_Acces", type="integer", example=5),
     *             @OA\Property(property="IsActive", type="boolean", example=true),
     *             @OA\Property(property="Date_Expiration", type="string", example="2026-01-01 00:00:00")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Lien mis à jour"
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
            'Code_unique' => 'sometimes|string|max:255',
            'URL' => 'sometimes|string|max:500',
            'Nb_Acces' => 'sometimes|integer',
            'IsActive' => 'sometimes|boolean',
            'Date_Expiration' => 'sometimes|date|nullable',
        ]);

        $validated['Date_Creation'] = now();

        $status = LienHelper::UpdateLink($id, $validated);

        if ($status === "error") {
            return response()->json(['message' => 'Update failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * @OA\Delete(
     *     path="/api/links/{id}",
     *     summary="Supprimer un lien de partage",
     *     tags={"Liens"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID du lien",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Lien supprimé"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur lors de la suppression"
     *     )
     * )
     */
    public function destroy($id)
    {
        $status = LienHelper::DeleteLinkById($id);

        if ($status === "error") {
            return response()->json(['message' => 'Delete failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }
    /**
     * @OA\Get(
     *     path="/api/links",
     *     summary="Récupérer tous les liens",
     *     tags={"Liens"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Liste de tous les liens"
     *     )
     * )
     */
    public function getAll()
    {
        $links = LienHelper::GetAllLink();

        return response()->json($links);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{id}/links",
     *     summary="Récupérer tous les liens d’un utilisateur",
     *     tags={"Liens"},
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
     *         description="Liste des liens associés à l'utilisateur"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Aucun lien trouvé ou utilisateur inexistant"
     *     )
     * )
     */
    public function getAllByUser($id)
    {
        $links = LienHelper::GetAllLinkByUserId($id);

        if (!$links || count($links) === 0) {
            return response()->json(['message' => 'No links found for this user'], 404);
        }

        return response()->json($links);
    }

}
