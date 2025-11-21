<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\DocumentHelper;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:sanctum'); 
    }

    public function show($id)
    {
        $document = DocumentHelper::GetDocumentById($id);

        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        return response()->json($document);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Id_User'        => 'required|integer',
            'Nom_document'   => 'required|string|max:255',
            'Chemin_stockage'=> 'required|string|max:500',
            'Tailles_MB'     => 'required|numeric',
            'IsActive'       => 'boolean',
        ]);

        $validated['Date_Creation'] = now();
        $validated['Date_Update']   = now();

        $status = DocumentHelper::InsertDoc($validated);

        return response()->json(['status' => $status], $status === 'success' ? 201 : 400);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'Nom_document'   => 'sometimes|string|max:255',
            'Chemin_stockage'=> 'sometimes|string|max:500',
            'Tailles_MB'     => 'sometimes|numeric',
            'IsActive'       => 'sometimes|boolean',
        ]);

        $validated['Date_Update'] = now();

        $status = DocumentHelper::UpdateDocumentById($id, $validated);

        if ($status === "error") {
            return response()->json(['message' => 'Update failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }

    public function destroy($id)
    {
        $status = DocumentHelper::DeleteDocumentById($id);

        if ($status === "error") {
            return response()->json(['message' => 'Delete failed'], 400);
        }

        return response()->json(['status' => 'success']);
    }
}
