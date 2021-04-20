/* eslint-disable @typescript-eslint/dot-notation */
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Network } from '@ionic-native/network/ngx';
import { SpeedTestService } from 'ng-speed-test';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  numbers: any[];
  netStatus: string;
  colorNetEstatus: string;
  constructor(
    private firestore: AngularFirestore,
    private network: Network,
    private speedTestService: SpeedTestService
  ) {
    this.firestore.firestore.enablePersistence().then(() => {
      console.log('Pensistence Enabled');
    });
    this.checkconnection();
    this.getNumbers();
  }

  getNumbers() {
    this.firestore
      .collection('/Numbers/')
      .get()
      .pipe()
      .subscribe((res) => {
        if (res) {
          if (res.docs.length === 0) {
            this.reload();
          }
          this.numbers = res.docs.map((e) => ({
            id: e.id,
            data: e.data(),
          }));
          console.log(this.numbers);
        }
      });
  }

  addNumber() {
    this.firestore
      .collection('/Numbers/')
      .add({ n: Math.floor(Math.random() * 1000) })
      .then(() => {
        console.log('toolkit added');
      });
    this.getNumbers();
  }

  deleteNumber(id) {
    this.firestore.doc('/Numbers/' + id).delete();
    this.getNumbers();
  }

  changeNetStatus(isEnabled: boolean) {
    if (isEnabled) {
      this.netStatus = 'ONLINE';
      this.colorNetEstatus = 'success';
      this.firestore.firestore.enableNetwork().then(() => {
        console.log('network enabled');
      });
    } else {
      this.netStatus = 'OFFLINE';
      this.colorNetEstatus = 'danger';
      this.firestore.firestore.disableNetwork().then(() => {
        console.log('network disabled');
      });
    }
  }

  checkconnection() {
    if (this.network.type === 'none') {
      this.changeNetStatus(false);
    } else {
      this.changeNetStatus(true);
    }

    this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(***********');
      this.changeNetStatus(false);
    });

    this.network.onConnect().subscribe(() => {
      console.log('network connected!************');
      this.changeNetStatus(true);
    });

    this.speedTestService.isOnline().subscribe((isOnline) => {
      console.log('***********', isOnline);
      this.changeNetStatus(isOnline);
    });
  }

  reload() {
    //this.splashscreen.show();
    window.location.reload();
  }
}
