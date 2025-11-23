<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\LienHelper;
use Illuminate\Support\Facades\Storage;

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
        $request->validate([
            'Id_Doc' => 'required|integer', // Le React envoie "Id_Doc"
            'Code_unique' => 'required|string|max:255',
            'URL' => 'required|string|max:500',
            'isActive' => 'boolean',
            'Date_Expiration' => 'nullable|string', // Le front envoie une string ISO date
        ]);

        $dataToInsert = [
            'Id_Document' => $request->Id_Doc, // Mapping : Id_Doc devient Id_Document
            'Code_unique' => $request->Code_unique,
            'URL' => $request->URL,
            'Nb_Acces' => 0,
            'IsActive' => $request->input('isActive', true),
            'Date_Expiration' => $request->Date_Expiration ? date('Y-m-d H:i:s', strtotime($request->Date_Expiration)) : null,
            'Date_Creation' => now(),
        ];

        $status = LienHelper::InsertLink($dataToInsert);

        // 4. Réponse JSON
        if ($status === 'success') {
            return response()->json(['status' => 'success', 'message' => 'Lien créé avec succès'], 201);
        } else {
            return response()->json(['status' => 'error', 'message' => 'Erreur lors de la création du lien'], 400);
        }

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
    public function getByCode($code)
    {
        $lien = LienHelper::GetLinkByUniqueCode($code);

        if (!$lien) {
            return response()->json(['message' => 'Lien introuvable'], 404);
        }

        // 2. On renvoie la réponse JSON
        return response()->json(['status' => 'success', 'link' => $lien]);
    }
    public function downloadFile(Request $request, $code)
    {
        // 1. On retrouve le lien
        $lien = LienHelper::GetLinkByUniqueCode($code);

        if (!$lien || !$lien->document) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        // 2. Vérifications de sécurité
        if (!$lien->IsActive) {
            return response()->json(['message' => 'Ce lien a été désactivé'], 403);
        }
        if ($lien->Date_Expiration && now()->gt($lien->Date_Expiration)) {
            return response()->json(['message' => 'Ce lien a expiré'], 403);
        }

        // 3. Compteur +1
        $lien->increment('Nb_Acces');

        // 4. On récupère le chemin du fichier sur le disque
        $path = $lien->document->Chemin_stockage;

        // Vérification physique
        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'Erreur serveur : Fichier physique manquant'], 404);
        }

        // 5. On lance le téléchargement
        return response()->download(
            Storage::disk('public')->path($path),
            $lien->document->Nom_document
        );
    }
    public function downloadFileV2(Request $request, $code)
    {
        // ... tes vérifications 1, 2, 3 ... (Helper, Compteur, etc)
        $lien = LienHelper::FindActiveDownloadLink($code);
        if (!$lien || !$lien->document)
            return response()->json(['message' => 'Fichier introuvable'], 404);

        $lien->increment('Nb_Acces');

        $relativePath = $lien->document->Chemin_stockage;

        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'Fichier physique manquant'], 404);
        }

        // On utilise le chemin absolu
        $absolutePath = Storage::disk('public')->path($relativePath);

        // Correction CORS explicite au cas où le middleware échoue
        $headers = [
            'Access-Control-Allow-Origin' => 'http://localhost:3000',
            'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, X-Auth-Token, Origin, Authorization',
        ];

        // Utilise download() au lieu de file() pour forcer le mode "pièce jointe"
        return response()->download($absolutePath, $lien->document->Nom_document, $headers);
    }

}
