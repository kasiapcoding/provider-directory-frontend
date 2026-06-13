import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { SplitButton } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-test',
  imports: [ToolbarModule, Button, SplitButton],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {}
