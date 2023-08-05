import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CuponesDescuentosService } from '../../../services/cupones-descuentos/cupones-descuentos.service';
import { ToastService } from '../../../services/toast/toast.service';
import { DepartamentosService } from '../../../services/departamentos/departamentos.service';
import { CategoriasService } from '../../../services/categorias/categorias.service';
import { SubcategoriasService } from '../../../services/subcategorias/subcategorias.service';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { ProductosService } from '../../../services/productos/productos.service';
import { map } from 'rxjs/operators';
import { EmpresasService } from '../../../services/empresas/empresas.service';

@Component({
  selector: 'app-cupones-descuentos',
  templateUrl: './cupones-descuentos.component.html',
  styleUrls: ['./cupones-descuentos.component.css'],
})
export class CuponesDescuentosComponent implements OnInit {
  form: FormGroup;
  cupon: any;
  cupones: any[] = [];
  fields_select_values: {
    usuarios: any[];
    usuarios_s: any[];
    departamentos: any[];
    departamentos_s: any[];
    categorias: any[];
    categorias_s: any[];
    subcategorias: any[];
    subcategorias_s: any[];
    productos: any[];
    productos_s: any[];
    empresas: any[];
    empresas_s: any[];
    empleados: any[];
    empleados_s: any[];
  } = {
    usuarios: [],
    usuarios_s: [],
    departamentos: [],
    departamentos_s: [],
    categorias: [],
    categorias_s: [],
    subcategorias: [],
    subcategorias_s: [],
    productos: [],
    productos_s: [],
    empresas: [],
    empresas_s: [],
    empleados: [],
    empleados_s: [],
  };
  public search: {
    productos: string;
    departamentos: string;
    categorias: string;
    subcategorias: string;
    empresas: string;
    usuarios: string;
    empleados: string;
  } = {
    productos: '',
    departamentos: '',
    categorias: '',
    subcategorias: '',
    empresas: '',
    usuarios: '',
    empleados: '',
  };

  constructor(
    private _cuponesDescuentosService: CuponesDescuentosService,
    private _departamentosService: DepartamentosService,
    private _categoriasService: CategoriasService,
    private _subcategoriasService: SubcategoriasService,
    private _usuariosService: UsuariosService,
    private _productosService: ProductosService,
    private _empresasService: EmpresasService,
    private _toast: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getCuponesDescuentos();
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  initForm() {
    this.form = new FormGroup({
      codigo: new FormControl(null, [Validators.required]),
      valor: new FormControl(null, [Validators.required]),
      tipo: new FormControl(null, [Validators.required]),
      caduca: new FormControl(false, [Validators.required]),
      tipoCaducidad: new FormControl(null, []),
      fechaInicio: new FormControl(null, []),
      fechaCaducidad: new FormControl(null, []),
      intentos: new FormControl(0, []),
      intentosMaximos: new FormControl(null, []),
      compraMinima: new FormControl(false, [Validators.required]),
      valorCompraMinima: new FormControl(null, []),
      usuario: new FormControl(false, [Validators.required]),
      usuarios: new FormControl(null, []),
      producto: new FormControl(false, [Validators.required]),
      productos: new FormControl(null, []),
      categoria: new FormControl(false, [Validators.required]),
      categorias: new FormControl(null, []),
      subcategoria: new FormControl(false, [Validators.required]),
      subcategorias: new FormControl(null, []),
      departamento: new FormControl(false, [Validators.required]),
      departamentos: new FormControl(null, []),
      empresa: new FormControl(false, [Validators.required]),
      empresas: new FormControl(null, []),
      deleted: new FormControl(null, []),
    });
  }

  getCuponesDescuentos() {
    this._cuponesDescuentosService.get({}).subscribe((resp) => {
      console.log(resp);
      this.cupones = resp.cupones;
      this.getFieldsValues();
    });
  }

  getFieldsValues() {
    this._usuariosService
      .get({ search: this.search.usuarios })
      .subscribe((resp) => {
        this.fields_select_values.usuarios = resp.usuarios;
      });
    this._departamentosService
      .get({ search: this.search.departamentos })
      .subscribe((resp) => {
        this.fields_select_values.departamentos = resp.departamentos;
      });
    this._categoriasService
      .get({ search: this.search.categorias })
      .subscribe((resp) => {
        this.fields_select_values.categorias = resp.categorias;
      });
    this._subcategoriasService
      .get({
        search: this.search.subcategorias,
      })
      .subscribe((resp) => {
        this.fields_select_values.subcategorias = resp.subcategorias;
      });
    this._productosService
      .getCompiled({ search: this.search.productos })
      .subscribe((resp) => {
        this.fields_select_values.productos = resp.productos;
      });
    this._empresasService
      .get({ search: this.search.empresas })
      .subscribe((resp) => {
        this.fields_select_values.empresas = resp.empresas;
      });
  }

  handleSubmit() {
    console.table(this.form.value);
    if (this.form.valid) {
      if (!!this.cupon) {
        this.handleEdit();
      } else {
        this.handleAdd();
      }
    } else {
      this._toast.showNotification(
        'top',
        'right',
        'danger',
        'Formulario no válido o incompleto'
      );
    }
  }

  handleReset() {
    this.form.reset();
    this.form.patchValue({
      caduca: false,
      compraMinima: false,
      usuario: false,
      intentos: 0,
      producto: false,
      categoria: false,
      subcategoria: false,
      departamento: false,
      empresa: false,
    });
    this.getCuponesDescuentos();
  }

  handleCancel() {
    this.cupon = undefined;
    this.form.reset();
  }

  handleDelete(id) {
    this._cuponesDescuentosService.delete(id).subscribe((resp) => {
      this.getCuponesDescuentos();
      this._toast.showNotification(
        'top',
        'right',
        'success',
        'Cupón de descuento eliminado correctamente'
      );
    });
  }

  handleEdit() {
    this.form.controls.productos.setValue(
      this.fields_select_values.productos_s
    );
    this.form.controls.categorias.setValue(
      this.fields_select_values.categorias_s
    );
    this.form.controls.subcategorias.setValue(
      this.fields_select_values.subcategorias_s
    );
    this.form.controls.departamentos.setValue(
      this.fields_select_values.departamentos_s
    );
    this.form.controls.usuarios.setValue(this.fields_select_values.usuarios_s);
    this.form.controls.empresas.setValue(this.fields_select_values.empresas_s);
    this._cuponesDescuentosService
      .update(this.cupon._id, this.form.value)
      .subscribe((resp: any) => {
        this.handleReset();
        this._toast.showNotification(
          'top',
          'right',
          'success',
          'Cupón de descuento editado correctamente'
        );
      });
  }

  handleAdd() {
    this.form.controls.productos.setValue(
      this.fields_select_values.productos_s
    );
    this.form.controls.categorias.setValue(
      this.fields_select_values.categorias_s
    );
    this.form.controls.subcategorias.setValue(
      this.fields_select_values.subcategorias_s
    );
    this.form.controls.departamentos.setValue(
      this.fields_select_values.departamentos_s
    );
    this.form.controls.usuarios.setValue(this.fields_select_values.usuarios_s);
    this.form.controls.empresas.setValue(this.fields_select_values.empresas_s);
    this._cuponesDescuentosService.insert(this.form.value).subscribe((resp) => {
      this.handleReset();
      this._toast.showNotification(
        'top',
        'right',
        'success',
        'Cupón de descuento creado correctamente'
      );
    });
  }

  handleEditCupon(cupon) {
    this.cupon = { ...cupon };
    this.fields_select_values.productos = !!this.cupon.productos
      ? this.cupon.productos
      : [];
    this.fields_select_values.categorias = !!this.cupon.categorias
      ? this.cupon.categorias
      : [];
    this.fields_select_values.subcategorias = !!this.cupon.subcategorias
      ? this.cupon.subcategorias
      : [];
    this.fields_select_values.departamentos = !!this.cupon.departamentos
      ? this.cupon.departamentos
      : [];
    this.fields_select_values.usuarios = !!this.cupon.usuarios
      ? this.cupon.usuarios
      : [];
    this.fields_select_values.empresas = !!this.cupon.empresas
      ? this.cupon.empresas
      : [];

    this.fields_select_values.productos_s = !!this.cupon.productos
      ? this.cupon.productos
      : [];
    this.fields_select_values.categorias_s = !!this.cupon.categorias
      ? this.cupon.categorias
      : [];
    this.fields_select_values.subcategorias_s = !!this.cupon.subcategorias
      ? this.cupon.subcategorias
      : [];
    this.fields_select_values.departamentos_s = !!this.cupon.departamentos
      ? this.cupon.departamentos
      : [];
    this.fields_select_values.usuarios_s = !!this.cupon.usuarios
      ? this.cupon.usuarios
      : [];
    this.fields_select_values.empresas_s = !!this.cupon.empresas
      ? this.cupon.empresas
      : [];

    cupon.productos = !!cupon.productos
      ? cupon.productos.map((res: any) => res._id)
      : [];
    cupon.categorias = !!cupon.categorias
      ? cupon.categorias.map((res: any) => res._id)
      : [];
    cupon.subcategorias = !!cupon.subcategorias
      ? cupon.subcategorias.map((res: any) => res._id)
      : [];
    cupon.departamentos = !!cupon.departamentos
      ? cupon.departamentos.map((res: any) => res._id)
      : [];
    cupon.usuarios = !!cupon.usuarios
      ? cupon.usuarios.map((res: any) => res._id)
      : [];
    cupon.empresas = !!cupon.empresas
      ? cupon.empresas.map((res: any) => res._id)
      : [];

    cupon.fechaInicio = cupon.fechaInicio.split('T')[0];
    cupon.fechaCaducidad = cupon.fechaCaducidad
      .split('T')[0]
      ;

    console.log(cupon);
    this.form.patchValue(cupon);
  }

  seleccionados(
    element: any,
    tipo:
      | 'productos'
      | 'categorias'
      | 'subcategorias'
      | 'departamentos'
      | 'empresas'
      | 'usuarios'
  ) {
    console.log(this.form.value[tipo]);

    if (
      !!this.form.value[tipo] &&
      this.form.value[tipo].includes(element._id)
    ) {
      this.form.value[tipo].splice(
        this.form.value[tipo].indexOf(element._id),
        1
      );
      this.fields_select_values[tipo + '_s'] = this.fields_select_values[
        tipo + '_s'
      ].filter((_element) => _element._id !== element._id);
      return;
    }

    this.fields_select_values[tipo + '_s'] = [
      ...this.fields_select_values[tipo + '_s'],
      element,
    ];
    this.form.patchValue({
      [tipo]: [
        ...this.fields_select_values[tipo + '_s'].map(
          (_element: any) => _element._id
        ),
      ],
    });
  }

  findSeleccionado(
    object: any,
    type:
      | 'productos'
      | 'categorias'
      | 'subcategorias'
      | 'departamentos'
      | 'empresas'
      | 'usuarios'
  ): number {
    return this.form.value[type]?.findIndex(
      (element) => element === object._id
    );
  }

  onSelectAll($event: any) {
    console.log($event);
  }
}
