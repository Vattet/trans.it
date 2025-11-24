<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\HistoriqueHelper;
use OpenApi\Attributes as OA;

class HistoriqueController extends Controller
{
    /**
     * @OA\Get(
     * path="/api/history/{id}",
     * summary="Récupérer un historique par son ID",
     * tags={"Historique"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID de l'historique",
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Détails de l'historique",
     * @OA\JsonContent(
     * @OA\Property(property="ID", type="integer"),
     * @OA\Property(property="Id_Lien", type="integer"),
     * @OA\Property(property="Action", type="string"),
     * @OA\Property(property="Date_Action", type="string", format="date-time"),
     * @OA\Property(property="Adresse_IP", type="string")
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Historique introuvable"
     * )
     * )
     */
    public function getById($id)
    {
        $history = HistoriqueHelper::GetHistoryById($id);

        if (!$history) {
            return response()->json(['error' => 'Historique introuvable'], 404);
        }

        return response()->json($history);
    }

    /**
     * @OA\Get(
     * path="/api/links/{id}/history",
     * summary="Récupérer l'historique d'un lien spécifique",
     * tags={"Historique"},
     * security={{"bearerAuth":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID du lien",
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Liste des historiques pour ce lien",
     * @OA\JsonContent(
     * type="array",
     * @OA\Items(
     * @OA\Property(property="ID", type="integer"),
     * @OA\Property(property="Id_Lien", type="integer"),
     * @OA\Property(property="Action", type="string"),
     * @OA\Property(property="Date_Action", type="string", format="date-time"),
     * @OA\Property(property="Adresse_IP", type="string")
     * )
     * )
     * ),
     * @OA\Response(
     * response=404,
     * description="Aucun historique trouvé pour ce lien"
     * )
     * )
     */
    public function getByLinkId($id)
    {
        $histories = HistoriqueHelper::GetHistoryByLinkId($id);

        if ($histories->isEmpty()) {
            return response()->json(['error' => 'Aucun historique pour ce lien'], 404);
        }

        return response()->json($histories);
    }

    /**
     * @OA\Post(
     * path="/api/history",
     * summary="Ajouter une entrée dans l'historique",
     * tags={"Historique"},
     * security={{"bearerAuth":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"Id_Lien", "Action", "Adresse_IP"},
     * @OA\Property(property="Id_Lien", type="integer", example=12),
     * @OA\Property(property="Action", type="string", example="download"),
     * @OA\Property(property="Adresse_IP", type="string", example="192.168.1.1")
     * )
     * ),
     * @OA\Response(
     * response=201,
     * description="Historique créé avec succès",
     * @OA\JsonContent(
     * @OA\Property(property="status", type="string", example="success")
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Erreur lors de la création"
     * )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'Id_Lien' => 'required|integer',
            'Action' => 'required|string',
            'Adresse_IP' => 'required|string',
        ]);

        $status = HistoriqueHelper::InsertHistory($request->all());

        if ($status !== "success") {
            return response()->json(['error' => 'Erreur lors de la création'], 500);
        }

        return response()->json(['status' => 'success'], 201);
    }
}