import { Component, OnInit } from '@angular/core';

import { UsersListService } from 'src/app/shared/services/list-users.service';

import { FirebaseUserModel } from 'src/app/shared/models/user.model';

@Component({
    selector: 'modal-privilege-desktop',
    templateUrl: './modal-privilege-desktop.component.html',
    styleUrls: ['./modal-privilege-desktop.scss']
})

export class ModalPrivilegeDesktopComponent implements OnInit{

    currentUser: FirebaseUserModel;

    constructor(public usersListService: UsersListService) {}

    ngOnInit() {}

    changePrivliegeStatus(currentUser: FirebaseUserModel) {
        this.usersListService.update(currentUser.key, currentUser);
    }

}
