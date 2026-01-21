import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'productos';

    if (!file) {
      return NextResponse.json({ error: 'No se recibio archivo' }, { status: 400 });
    }

    // Generar nombre unico
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}.${extension}`;

    // Convertir a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Error subiendo a Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Obtener URL publica
    const { data: urlData } = supabase.storage
      .from('imagenes')
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName
    });

  } catch (error) {
    console.error('Error en upload:', error);
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
  }
}
