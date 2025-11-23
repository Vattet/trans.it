<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $table = 'Document';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Id_User',
        'Nom_document',
        'Chemin_stockage',
        'Tailles_MB',
        'IsActive',
        'Date_Update',
        'Date_Creation',
    ];

    protected $casts = [
        'Tailles_MB' => 'float',
        'IsActive' => 'boolean',
        'Date_Update' => 'datetime',
        'Date_Creation' => 'datetime',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class, 'Id_User', 'ID');
    }

    public function lien()
    {
        return $this->hasOne(Lien::class, 'Id_Document', 'ID');
    }

    public function parametre()
    {
        return $this->hasOne(ParametreDocument::class, 'Id_Document', 'ID');
    }
}
