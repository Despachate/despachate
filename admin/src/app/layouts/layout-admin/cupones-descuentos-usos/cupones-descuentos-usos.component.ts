import { Component, OnInit } from '@angular/core';
import { HistorialCuponesService } from '../../../services/historial-cupones/historial-cupones.service';
import { EmpresasService } from '../../../services/empresas/empresas.service';

@Component({
  selector: 'app-cupones-descuentos-usos',
  templateUrl: './cupones-descuentos-usos.component.html',
  styleUrls: ['./cupones-descuentos-usos.component.css'],
})
export class CuponesDescuentosUsosComponent implements OnInit {
  filter: {
    fecha_inicio?: string;
    fecha_fin?: string;
    empresa?: string;
  } = {};

  empresas: any[] = [];

  data: { historial_cupones: any[] } = { historial_cupones: [] };

  constructor(
    private _historialCuponesService: HistorialCuponesService,
    private _empresasService: EmpresasService
  ) {}

  ngOnInit(): void {
    this.getHistorialCupones();
    this._empresasService.get().subscribe((resp: any) => {
      this.empresas = resp.empresas;
    });
  }

  getHistorialCupones() {
    let filter = { ...this.filter };
    // remove undefined values
    Object.keys(filter).forEach(
      (key) => filter[key] === undefined && delete filter[key]
    );
    this._historialCuponesService
      .get({
        ...filter,
      })
      .subscribe((resp: any) => {
        this.data.historial_cupones = resp.historialCupones;
      });
  }
  getUsuarios(usuarios: any[]) {
    return usuarios?.map((usuario) => usuario.nombre).join(', ');
  }
}
