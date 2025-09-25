import { Component, OnInit } from '@angular/core';

import { UsersListService } from 'src/app/shared/services/list-users.service';

import { FirebaseUserModel } from 'src/app/shared/models/user.model';

@Component({
    selector: 'modal-privilege-mobile',
    templateUrl: './modal-privilege-mobile.component.html',
    styleUrls: ['./modal-privilege-mobile.scss']
})

export class ModalPrivilegeMobileComponent implements OnInit{

    currentUser: FirebaseUserModel;
    dialogRef: any;

    constructor(public usersListService: UsersListService) {}

    ngOnInit() {}

    changePrivliegeStatus(currentUser: FirebaseUserModel) {
        this.usersListService.update(currentUser.key, currentUser);
    }

}
