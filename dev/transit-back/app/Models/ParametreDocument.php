<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametreDocument extends Model
{
    protected $table = 'Parametre_Document';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Id_Document',
        'Protection_MotDePasse',
        'Mot_de_passe',
        'Date_Expiration',
        'Date_Update',
        'Date_Creation',
    ];

    protected $casts = [
        'Protection_MotDePasse' => 'boolean',
        'Date_Expiration' => 'datetime',
        'Date_Update' => 'datetime',
        'Date_Creation' => 'datetime',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class, 'Id_Document', 'ID');
    }
}
