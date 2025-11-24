<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\HistoriqueHelper;

class HistoriqueController extends Controller
{
    /** GET by history ID */
    public function getById($id)
    {
        $history = HistoriqueHelper::GetHistoryById($id);

        if (!$history) {
            return response()->json(['error' => 'Historique introuvable'], 404);
        }

        return response()->json($history);
    }

    /** GET all history for a link */
    public function getByLinkId($id)
    {
        $histories = HistoriqueHelper::GetHistoryByLinkId($id);

        if ($histories->isEmpty()) {
            return response()->json(['error' => 'Aucun historique pour ce lien'], 404);
        }

        return response()->json($histories);
    }

    /** POST: Insert history */
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
