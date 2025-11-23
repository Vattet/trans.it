<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Parametre_DocumentHelper;

class ParametreDocumentController extends Controller
{
    // GET /api/documents/{id}/params
    public function getByDoc($id)
    {
        $params = Parametre_DocumentHelper::GetParameterByDocId($id);
        return response()->json($params);
    }

    // POST /api/document-params
    public function store(Request $request)
    {
        $request->validate([
            'Id_Document' => 'required|integer|exists:Document,ID',
            'Protection_MotDePasse' => 'boolean',
        ]);

        $result = Parametre_DocumentHelper::InsertParamDoc($request->all());
        return response()->json($result, 201);
    }

    // PUT /api/document-params/{id}
    public function update(Request $request, $id)
    {
        $result = Parametre_DocumentHelper::UpdateParamById($id, $request->all());
        return response()->json(['status' => $result]);
    }

    // DELETE /api/document-params/{id}
    public function destroy($id)
    {
        $status = Parametre_DocumentHelper::DeleteParameterDocumentById($id);
        
        // On renvoie un code 200 si ok, sinon on laisse 200 avec le status "error" 
        // (ou 404 si tu préfères être strict, mais restons sur ton format actuel)
        return response()->json(['status' => $status]);
    }
}