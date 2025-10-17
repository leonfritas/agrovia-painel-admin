import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (type === 'video' && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Arquivo deve ser um vídeo' }, { status: 400 });
    }

    if (type === 'image' && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 50MB' }, { status: 400 });
    }

    // Determinar diretório de destino
    const uploadDir = type === 'video' ? 'public/videos' : 'public/images';
    const uploadPath = join(process.cwd(), uploadDir);

    // Criar diretório se não existir
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Gerar nome do arquivo
    let fileName: string;
    if (type === 'video') {
      // Para vídeos, usar o nome original do arquivo
      fileName = file.name;
    } else {
      // Para imagens, usar timestamp para evitar conflitos
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      fileName = `image_${timestamp}.${fileExtension}`;
    }
    const filePath = join(uploadPath, fileName);

    // Converter ArrayBuffer para Buffer e salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL do arquivo
    const fileUrl = `/${uploadDir}/${fileName}`;

    console.log(`Arquivo ${type} salvo:`, fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
