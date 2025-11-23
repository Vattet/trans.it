<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\HistoriqueHelper;

class HistoriqueController extends Controller
{
    // GET /api/histories/{id}
    public function show($id)
    {
        $history = HistoriqueHelper::GetHistoryById($id);
        return response()->json($history);
    }

    // GET /api/links/{id}/histories
    public function getByLink($id)
    {
        $histories = HistoriqueHelper::GetHistoryByLinkId($id);
        return response()->json($histories);
    }

    // POST /api/histories
    public function store(Request $request)
    {
        // Récupération automatique de l'IP si non fournie
        $data = $request->all();
        if (!isset($data['Adresse_IP'])) {
            $data['Adresse_IP'] = $request->ip();
        }

        $request->validate([
            'Id_Lien' => 'required|integer|exists:Lien,ID',
            'Action' => 'required|string'
        ]);

        $result = HistoriqueHelper::InsertHistory($data);
        return response()->json(['status' => $result], 201);
    }
}