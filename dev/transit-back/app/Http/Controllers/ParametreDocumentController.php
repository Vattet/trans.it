<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Parametre_DocumentHelper;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class ParametreDocumentController extends Controller
{
    /**
     * @OA\Get(
     * path="/api/document-params/{id}",
     * summary="Récupérer un paramètre de document par son ID",
     * tags={"ParametreDocument"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID du paramètre",
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Détails du paramètre",
     * @OA\JsonContent(
     * @OA\Property(property="ID", type="integer"),
     * @OA\Property(property="Protection_MotDePasse", type="boolean"),
     * @OA\Property(property="Date_Expiration", type="string", format="date"),
     * @OA\Property(property="Date_Update", type="string", format="date-time"),
     * @OA\Property(property="Date_Creation", type="string", format="date-time")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Paramètre document introuvable"
     * )
     * )
     */
    public function getById($id)
    {
        $param = Parametre_DocumentHelper::GetParameterByDocId($id);

        if (!$param) {
            return response()->json(['error' => 'Paramètre document introuvable'], 404);
        }

        return response()->json($param);
    }

    /**
     * @OA\Get(
     * path="/api/users/{id}/document-params",
     * summary="Récupérer les paramètres de document d'un utilisateur",
     * tags={"ParametreDocument"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de l'utilisateur",
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Paramètre trouvé"
     * ),
     * @OA\Response(
     * response=404,
     * description="Aucun paramètre document trouvé pour cet utilisateur"
     * )
     * )
     */
    public function getByUserId($userId)
    {
        $param = Parametre_DocumentHelper::GetParamByUserId($userId);

        if (!$param) {
            return response()->json(['error' => 'Aucun paramètre document trouvé pour cet utilisateur'], 404);
        }

        return response()->json($param);
    }

    /**
     * @OA\Post(
     * path="/api/document-params",
     * summary="Créer des paramètres pour un document",
     * tags={"ParametreDocument"},
     * security={{"bearerAuth":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"Id_Document"},
     * @OA\Property(property="Id_Document", type="integer", example=10),
     * @OA\Property(property="Protection_MotDePasse", type="boolean", example=true),
     * @OA\Property(property="Mot_de_passe", type="string", example="Secret123"),
     * @OA\Property(property="Date_Expiration", type="string", format="date", example="2025-12-31")
     * )
     * ),
     * @OA\Response(
     * response=201,
     * description="Paramètre créé avec succès"
     * ),
     * @OA\Response(
     * response=500,
     * description="Erreur création paramètre"
     * )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'Protection_MotDePasse' => 'nullable|boolean',
            'Mot_de_passe' => 'nullable|string',
            'Date_Expiration' => 'nullable|date',
        ]);
        $data = $request->all();

        if (!empty($data['Mot_de_passe'])) {
            $data['Mot_de_passe'] = Hash::make($data['Mot_de_passe']);
            $data['Protection_MotDePasse'] = true;
        } else {
            $data['Mot_de_passe'] = null;
            $data['Protection_MotDePasse'] = false;
        }

        $param = Parametre_DocumentHelper::InsertParamDoc($data);

        if (!$param) {
            return response()->json(['error' => 'Erreur création paramètre'], 500);
        }

        return response()->json($param, 201);
    }

    /**
     * @OA\Put(
     * path="/api/document-params/{id}",
     * summary="Mettre à jour les paramètres d'un document",
     * tags={"ParametreDocument"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID du paramètre",
     * @OA\Schema(type="integer")
     * ),
     * @OA\RequestBody(
     * @OA\JsonContent(
     * @OA\Property(property="Protection_MotDePasse", type="boolean"),
     * @OA\Property(property="Mot_de_passe", type="string"),
     * @OA\Property(property="Date_Expiration", type="string", format="date")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Mise à jour réussie"
     * ),
     * @OA\Response(
     * response=404,
     * description="Paramètre introuvable"
     * ),
     * @OA\Response(
     * response=500,
     * description="Erreur mise à jour"
     * )
     * )
     */
    public function update(Request $request, $id)
    {
        $status = Parametre_DocumentHelper::UpdateParamById($id, $request->all());

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        if ($status !== "success") {
            return response()->json(['error' => 'Erreur mise à jour'], 500);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * @OA\Delete(
     * path="/api/document-params/{id}",
     * summary="Supprimer les paramètres d'un document",
     * tags={"ParametreDocument"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID du paramètre",
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Supprimé avec succès"
     * ),
     * @OA\Response(
     * response=404,
     * description="Paramètre introuvable"
     * )
     * )
     */
    public function delete($id)
    {
        $status = Parametre_DocumentHelper::DeleteById($id);

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        return response()->json(['status' => 'deleted']);
    }
}