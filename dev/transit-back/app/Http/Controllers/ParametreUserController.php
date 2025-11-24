<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\Parametre_UserHelper;
use OpenApi\Attributes as OA;

class ParametreUserController extends Controller
{
    /**
     * @OA\Get(
     * path="/api/user-params/{id}",
     * summary="Récupérer un paramètre utilisateur par son ID",
     * tags={"ParametreUser"},
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
     * @OA\Property(property="Id_User", type="integer"),
     * @OA\Property(property="Notification_Mail", type="boolean"),
     * @OA\Property(property="Langue", type="string"),
     * @OA\Property(property="Date_Update", type="string", format="date-time"),
     * @OA\Property(property="Date_Creation", type="string", format="date-time")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Paramètre introuvable"
     * )
     * )
     */
    public function getById($id)
    {
        $param = Parametre_UserHelper::GetParameterById($id);

        if (!$param) {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        return response()->json($param);
    }

    /**
     * @OA\Get(
     * path="/api/users/{id}/params",
     * summary="Récupérer les paramètres d'un utilisateur spécifique",
     * tags={"ParametreUser"},
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
     * description="Paramètres trouvés"
     * ),
     * @OA\Response(
     * response=404,
     * description="Aucun paramètre pour cet utilisateur"
     * )
     * )
     */
    public function getByUserId($userId)
    {
        $param = Parametre_UserHelper::GetParameterByUserId($userId);

        if (!$param) {
            return response()->json(['error' => 'Aucun paramètre pour cet utilisateur'], 404);
        }

        return response()->json($param);
    }

    /**
     * @OA\Post(
     * path="/api/user-params",
     * summary="Créer ou mettre à jour les paramètres d'un utilisateur",
     * tags={"ParametreUser"},
     * security={{"bearerAuth":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"Id_User"},
     * @OA\Property(property="Id_User", type="integer", example=1),
     * @OA\Property(property="Notification_Mail", type="boolean", example=true),
     * @OA\Property(property="Langue", type="string", example="fr")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Paramètres sauvegardés avec succès"
     * ),
     * @OA\Response(
     * response=500,
     * description="Erreur serveur"
     * )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'Id_User' => 'required|integer',
            'Notification_Mail' => 'boolean',
            'Langue' => 'string|max:10'
        ]);

        $data = [
            'Notification_Mail' => $request->input('Notification_Mail', false), // false par défaut
            'Langue' => $request->input('Langue', 'fr'),             // 'fr' par défaut
        ];

        try {
            $param = Parametre_UserHelper::CreateOrUpdate($request->Id_User, $data);

            return response()->json($param, 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur lors de la sauvegarde des paramètres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     * path="/api/users/{id}/params",
     * summary="Mettre à jour les paramètres d'un utilisateur via son ID User",
     * tags={"ParametreUser"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de l'utilisateur",
     * @OA\Schema(type="integer")
     * ),
     * @OA\RequestBody(
     * @OA\JsonContent(
     * @OA\Property(property="Notification_Mail", type="boolean"),
     * @OA\Property(property="Langue", type="string")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Mise à jour réussie"
     * )
     * )
     */
    public function update(Request $request, $id)
    {
        $request->merge(['Id_User' => $id]);
        return $this->store($request);
    }

    /**
     * @OA\Delete(
     * path="/api/user-params/{id}",
     * summary="Supprimer un paramètre par son ID",
     * tags={"ParametreUser"},
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
    public function deleteByParamId($id)
    {
        $status = Parametre_UserHelper::DeleteParameterById($id);

        if ($status === "not_found") {
            return response()->json(['error' => 'Paramètre introuvable'], 404);
        }

        return response()->json(['status' => 'deleted']);
    }

    /**
     * @OA\Delete(
     * path="/api/users/{id}/params",
     * summary="Supprimer les paramètres d'un utilisateur via son ID User",
     * tags={"ParametreUser"},
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
     * description="Supprimé avec succès"
     * ),
     * @OA\Response(
     * response=404,
     * description="Aucun paramètre trouvé pour cet utilisateur"
     * )
     * )
     */
    public function deleteByUserId($userId)
    {
        $status = Parametre_UserHelper::DeleteParameterByUserId($userId);

        if ($status === "not_found") {
            return response()->json(['error' => 'Aucun paramètre trouvé pour cet utilisateur'], 404);
        }

        return response()->json(['status' => 'deleted']);
    }
}