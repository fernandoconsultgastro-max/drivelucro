package com.drivelucro.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

public class OverlayManager {

    private final Activity activity;
    private WindowManager windowManager;
    private LinearLayout overlayView;
    private WindowManager.LayoutParams params;

    private int inicialX;
    private int inicialY;
    private float toqueInicialX;
    private float toqueInicialY;

    public OverlayManager(Activity activity) {
        this.activity = activity;
    }

    public void mostrarOverlay(String texto) {

        if (overlayView != null) return;

        String decisaoTexto = extrairDecisao(texto);
        int corDecisao = definirCorDecisao(decisaoTexto);

        windowManager =
                (WindowManager) activity.getSystemService(Activity.WINDOW_SERVICE);

        overlayView = new LinearLayout(activity);
        overlayView.setOrientation(LinearLayout.VERTICAL);
        overlayView.setPadding(36, 30, 36, 30);
        overlayView.setBackgroundColor(Color.parseColor("#E6111111"));

        TextView titulo = new TextView(activity);
        titulo.setText("DriveLucro Copiloto");
        titulo.setTextColor(Color.WHITE);
        titulo.setTextSize(15);
        titulo.setTypeface(null, Typeface.BOLD);

        TextView decisao = new TextView(activity);
        decisao.setText(decisaoTexto);
        decisao.setTextColor(corDecisao);
        decisao.setTextSize(28);
        decisao.setTypeface(null, Typeface.BOLD);

        TextView detalhes = new TextView(activity);
        detalhes.setText(texto);
        detalhes.setTextColor(Color.WHITE);
        detalhes.setTextSize(14);

        overlayView.addView(titulo);
        overlayView.addView(decisao);
        overlayView.addView(detalhes);

        params =
                new WindowManager.LayoutParams(
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.TYPE_APPLICATION_PANEL,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                        PixelFormat.TRANSLUCENT
                );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 40;
        params.y = 180;

        overlayView.setOnTouchListener((view, event) -> {

            switch (event.getAction()) {

                case MotionEvent.ACTION_DOWN:
                    inicialX = params.x;
                    inicialY = params.y;
                    toqueInicialX = event.getRawX();
                    toqueInicialY = event.getRawY();
                    return true;

                case MotionEvent.ACTION_MOVE:
                    params.x = inicialX + (int) (event.getRawX() - toqueInicialX);
                    params.y = inicialY + (int) (event.getRawY() - toqueInicialY);

                    if (windowManager != null && overlayView != null) {
                        windowManager.updateViewLayout(overlayView, params);
                    }
                    return true;

                default:
                    return false;
            }
        });

        windowManager.addView(overlayView, params);
    }

    private String extrairDecisao(String texto) {
        if (texto == null) return "ANALISAR";

        String t = texto.toUpperCase();

        if (t.contains("ACEITAR")) return "ACEITAR";
        if (t.contains("RECUSAR")) return "RECUSAR";
        if (t.contains("ANALISAR")) return "ANALISAR";

        return "ANALISAR";
    }

    private int definirCorDecisao(String decisao) {
        if ("ACEITAR".equals(decisao)) {
            return Color.parseColor("#39FF14");
        }

        if ("ANALISAR".equals(decisao)) {
            return Color.parseColor("#FFD54A");
        }

        if ("RECUSAR".equals(decisao)) {
            return Color.parseColor("#FF3B30");
        }

        return Color.WHITE;
    }

    public void removerOverlay() {

        if (overlayView != null && windowManager != null) {
            windowManager.removeView(overlayView);
            overlayView = null;
        }
    }
}