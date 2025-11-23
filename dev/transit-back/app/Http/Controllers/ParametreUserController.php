<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Parametre_UserHelper;

class ParametreUserController extends Controller
{
    // GET /api/user-params/{id}
    public function show($id)
    {
        $param = Parametre_UserHelper::GetParameterById($id);
        return response()->json($param);
    }

    // GET /api/users/{id}/params
    public function getByUser($id)
    {
        $param = Parametre_UserHelper::GetUserByParameterId($id);
        return response()->json($param);
    }

    // POST /api/user-params
    public function store(Request $request)
    {
        // Validation simple
        $request->validate([
            'Id_User' => 'required|integer|exists:User,ID',
            'Langue' => 'string|max:10'
        ]);

        $result = Parametre_UserHelper::InsertParamUser($request->all());
        return response()->json($result, 201);
    }

    // PUT /api/users/{id}/params
    public function update(Request $request, $id)
    {
        $result = Parametre_UserHelper::UpdateParameterByUserId($id, $request->all());
        return response()->json(['status' => $result]);
    }
}