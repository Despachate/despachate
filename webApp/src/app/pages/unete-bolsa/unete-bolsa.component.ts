import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MailingService } from '../../services/mailing/mailing.service';
import { SubirArchivosService } from '../../services/subir-archivos/subir-archivos.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-unete-bolsa',
  templateUrl: './unete-bolsa.component.html',
  styleUrls: ['./unete-bolsa.component.css']
})
export class UneteBolsaComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  form: FormGroup;
  archivosSubir: any[] = [];
  constructor(private _mailingService:MailingService,private _subirArchivoService:SubirArchivosService, private _toastService: ToastService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      empresa: new FormControl(null, Validators.required),
      nombre: new FormControl(null, Validators.required),
      correo: new FormControl(null, Validators.required),
      puesto: new FormControl(null, Validators.required),
      descripcion: new FormControl(null, Validators.required),
      productos: new FormControl(null, Validators.required),
      archivos: new FormControl(null)
     });
  }

  enviarCorreo(){
    console.log('entro a metodo');
    let date = new Date();
    if(this.archivosSubir.length > 0){
      this._subirArchivoService.subirArchivo(this.archivosSubir,'pdfs',date.getTime().toString()).then((res: any)=>{
        // this.consultarDatos();
        
        console.log('subio archivos',res);
        if(res.ok){
          this._toastService.showNotification('top','center','success','Se subieron los archivos correctamente, se te enviara un correo con todos los datos registrados');
          this._mailingService.enviarConfirmacion(this.form.get('correo').value, this.form.value, res.nombreArchivo).subscribe((res:any)=>{
            console.log(res);
            console.log('mando correo')
          });
        }
      });
    }else{
      this._toastService.showNotification('top','center','danger','No se seleccionaron archivo para subir');
    }
    // this._subirArchivoService.subirArchivo(this.archivosSubir,'pdfs','').then((res: any)=>{
    //   console.log(res);
    //   // this._mailingService.enviarConfirmacion(this.form.get('correo').value, this.form.value).subscribe((res:any)=>{
    //   //   console.log(res);
    //   // })
    // })
  }
  seleccionImage( archivo: File ) {
   
   
    // let reader = new FileReader();
    // let urlImagenTemp = reader.readAsDataURL( archivo );

    
    // reader.onloadend = () => {
    //   this.archivosSubir =  [archivo];
    // };
    this.archivosSubir =  [archivo];
    
  }

}
